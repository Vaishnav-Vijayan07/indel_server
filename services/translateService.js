// services/translateService.js
//
// Provider-agnostic machine-translation wrapper. The only provider implemented
// today is Google's free, keyless "translateHtml" endpoint used internally by
// Google's own website-translate widget (translate-pa.googleapis.com). It is
// unofficial/undocumented (no SLA, response shape could change without notice),
// so all calls to it are isolated here — swapping to an official paid provider
// (Google Cloud Translation API, Azure Translator) later only means changing
// `callGoogleWidgetEndpoint`, not any caller of `translateContent`.

const Logger = require("./logger");

const TRANSLATE_ENDPOINT = "https://translate-pa.googleapis.com/v1/translateHtml";
// Public web-client key baked into Google's own translate-widget JS; not a secret credential.
const GOOGLE_WIDGET_API_KEY = process.env.TRANSLATE_API_KEY || "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520";

const MAX_BATCH_SIZE = 100;

// Object keys whose string values should never be sent for translation
// (identifiers, slugs, URLs, media paths, contact details, etc.).
const SKIP_KEYS = new Set([
  "id",
  "_id",
  "uuid",
  "slug",
  "url",
  "link",
  "path",
  "href",
  "image",
  "imageUrl",
  "image_mobile",
  // "life_section_image1",
  // "life_section_image2",
  // "life_section_image3",
  "icon",
  "iconUrl",
  "logo",
  "avatar",
  "video",
  "videoUrl",
  "video_mobile",
  "file",
  "fileUrl",
  "thumbnail",
  // Compound CMS field names ending in "_mobile"/"_web" rather than the
  // structural suffix itself (e.g. icon_mobile, not mobile_icon) - these
  // slip past SKIP_KEY_SUFFIX_PATTERN since the suffix isn't at the end.
  "andrioid_download_icon_mobile",
  "apple_download_icon_mobile",
  "banner_image_mobile",
  "branch_locator_icon_mobile",
  "branch_locator_icon_web",
  "toll_free_icon_mobile",
  "toll_free_icon_web",
  "code",
  "colour",
  "color",
  "hex",
  "phone",
  "phoneNumber",
  "mobile",
  "email",
  "createdAt",
  "updatedAt",
  "date",
  "publishedAt",
  "startDate",
  "endDate",
  "expiryDate",
  "rate",
  "icon_type",
  "price",
  "amount",
  "type",
  "media_type",
  "status",
  "role",
  "order",
  "position",
]);

// CMS field names commonly compound a structural suffix onto a prefix
// (button_2_link, og_image, logo_url, banner_video, canonical_href) - an
// exact-match-only SKIP_KEYS check misses every one of these and sends real
// URLs/media paths off to be "translated" into garbage links. Suffix-matched
// against a normalized (underscores/case stripped) key so button_2_link,
// buttonLink, and BUTTON_2_LINK all skip alike. Kept to unambiguous
// URL/media-path terms only - broader terms like "id"/"date" are left as
// exact-match-only in SKIP_KEYS since they collide with real prose-bearing
// field names (e.g. "valid", "update") as a normalized suffix.
// "alt"/"alttext" cover CMS alt-text fields (image_alt, alt_text,
// banner_image_alt, etc.) - descriptive/accessibility metadata, not display
// prose, so it's skipped for the same reason as image/icon/logo above.
const SKIP_KEY_SUFFIXES = [
  "link",
  "url",
  "href",
  "path",
  "slug",
  "image",
  "icon",
  "video",
  "file",
  "thumbnail",
  "alt",
  "alttext",
];
// Matches a skip suffix optionally followed by trailing digits, e.g. "image1",
// "image2" - CMS fields like life_section_image1/2/3 append an index to the
// structural word, which a plain .endsWith(suffix) check would miss.
const SKIP_KEY_SUFFIX_PATTERN = new RegExp(`(${SKIP_KEY_SUFFIXES.join("|")})\\d*$`);

function shouldSkipKey(key) {
  if (!key) return false;
  if (SKIP_KEYS.has(key)) return true;
  const normalized = key.replace(/[_-]/g, "").toLowerCase();
  return SKIP_KEY_SUFFIX_PATTERN.test(normalized);
}

// Value-shape guard, independent of the key name: skip anything that looks
// like a URL/path/protocol reference outright, so a CMS field with an
// unrecognized key but a media/URL value can't slip through to translation.
const NON_TRANSLATABLE_VALUE_PATTERN = /^(https?:|\/|\.{1,2}\/|data:|mailto:|tel:|#)/i;

function isTranslatableValue(value) {
  if (NON_TRANSLATABLE_VALUE_PATTERN.test(value)) return false;
  return true;
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Replaces HTML tags in a string with indexed placeholders so only plain text
// is sent to the translation API. Block elements like <br/> would otherwise
// act as segment separators and split a single string into multiple translated
// fragments. The returned `tags` array holds the originals; call
// restoreHtmlTags to put them back in the translated output.
const HTML_TAG_RE = /<[^>]+>/g;

function extractHtmlTags(text) {
  const tags = [];
  const stripped = text.replace(HTML_TAG_RE, (tag) => {
    const idx = tags.length;
    tags.push(tag);
    return `[[[${idx}]]]`;
  });
  return { stripped, tags };
}

function restoreHtmlTags(text, tags) {
  if (!tags.length) return text;
  return text.replace(/\[\[\[(\d+)\]\]\]/g, (_, i) => tags[parseInt(i, 10)] ?? "");
}

async function callGoogleWidgetEndpoint(texts, targetLocale, sourceLocale = "en") {
  const response = await fetch(`${TRANSLATE_ENDPOINT}?key=${GOOGLE_WIDGET_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json+protobuf" },
    body: JSON.stringify([[texts, sourceLocale, targetLocale], "te_lib"]),
  });

  if (!response.ok) {
    throw new Error(`translate-pa.googleapis.com responded ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.[0];
  if (!Array.isArray(translated)) {
    throw new Error("Unexpected response shape from translate-pa.googleapis.com");
  }
  return translated;
}

// Translates a flat list of strings, batching requests to stay under the
// endpoint's practical payload limits. Guarantees a result of the same length
// and order as `texts` — callers index into it positionally.
async function translateBatch(texts, targetLocale, sourceLocale = "en") {
  if (texts.length === 0) return [];

  // Strip HTML tags into placeholders before translation so that block elements
  // like <br/> don't act as segment separators and split a single string into
  // multiple fragments. Tags are restored after the API responds.
  const tagMaps = texts.map(extractHtmlTags);
  const strippedTexts = tagMaps.map((m) => m.stripped);

  const batches = chunk(strippedTexts, MAX_BATCH_SIZE);
  const translatedStripped = [];
  for (const batch of batches) {
    const translated = await callGoogleWidgetEndpoint(batch, targetLocale, sourceLocale);
    // The endpoint is unofficial and has no contract on cardinality. A short
    // chunk would shift every later chunk onto the wrong translation, so fall
    // back to English for this chunk rather than emit misaligned data.
    if (translated.length !== batch.length) {
      Logger.warn(
        `translate: expected ${batch.length} strings for ${targetLocale}, got ${translated.length}; serving this chunk untranslated`,
      );
      translatedStripped.push(...batch);
      continue;
    }
    translatedStripped.push(...translated);
  }

  // Restore HTML tags into each translated string using its own tag map
  return translatedStripped.map((text, i) => restoreHtmlTags(text, tagMaps[i].tags));
}

// Walks an object/array tree, collecting translatable string leaves (skipping
// blacklisted keys), translates them in one batch, then rebuilds the tree with
// translated values in place. Non-string, non-object values pass through untouched.
async function translateContent(payload, targetLocale, sourceLocale = "en") {
  if (targetLocale === sourceLocale) return payload;

  const strings = [];
  const setters = [];

  function walk(node, keyHint) {
    if (typeof node === "string") {
      if (node.trim().length === 0 || shouldSkipKey(keyHint) || !isTranslatableValue(node)) return node;
      strings.push(node);
      const index = strings.length - 1;
      setters.push((translated) => {
        strings[index] = translated;
      });
      return { __placeholder: index };
    }

    if (Array.isArray(node)) {
      return node.map((item) => walk(item, keyHint));
    }

    if (node && typeof node === "object") {
      const result = {};
      for (const [key, value] of Object.entries(node)) {
        result[key] = walk(value, key);
      }
      return result;
    }

    return node;
  }

  function resolve(node) {
    if (node && typeof node === "object" && "__placeholder" in node && Object.keys(node).length === 1) {
      return strings[node.__placeholder];
    }
    if (Array.isArray(node)) {
      return node.map(resolve);
    }
    if (node && typeof node === "object") {
      const result = {};
      for (const [key, value] of Object.entries(node)) {
        result[key] = resolve(value);
      }
      return result;
    }
    return node;
  }

  const withPlaceholders = walk(payload, null);
  if (strings.length === 0) return payload;

  const translated = await translateBatch(strings, targetLocale, sourceLocale);
  translated.forEach((text, index) => {
    strings[index] = text;
  });

  return resolve(withPlaceholders);
}

module.exports = { translateContent, translateBatch };
