// middlewares/translateMiddleware.js
//
// Applies machine translation to outgoing JSON responses when a request asks
// for a supported non-English locale via `?lang=`. Mounted globally on `/api`
// so every existing (and future) GET endpoint gets translation for free — no
// per-controller changes needed. Only GET requests are touched; POST/PUT/etc.
// (form submissions, uploads, auth) pass through untouched regardless of `lang`.
const { translateContent } = require("../services/translateService");
const cacheService = require("../services/cacheService");
const Logger = require("../services/logger");

// Kept in sync with the client dropdown's TRANSLATION_LANGUAGES
// (client/src/components/layout/header/TranslatorDropdown.js). Bodo ("brx")
// and Kashmiri ("ks") are deliberately excluded — not supported by Google's
// translate-pa widget endpoint, same exclusion the client list already makes.
const SUPPORTED_LOCALES = [
  "hi",
  "ta",
  "te",
  "mr",
  "gu",
  "bn",
  "kn",
  "ml",
  "as",
  // "doi",
  "kok",
  "mai",
  // "mni-Mtei",
  // "ne",
  "or",
  "pa",
  // "sa",
  "sat",
  // "sd",
  "ur",
];

const CACHE_TTL_WITH_FRESHNESS_TOKEN =
  parseInt(process.env.TRANSLATE_CACHE_TTL_SECONDS, 10) || 30; // 30 seconds
const CACHE_TTL_WITHOUT_FRESHNESS_TOKEN = 30; // 30 seconds — bounds staleness when we can't detect content edits

// Best-effort content-version fingerprint so a content edit naturally busts
// the cache (new updatedAt -> new cache key -> miss -> retranslate).
function extractFreshnessToken(body) {
  const data = body?.data ?? body;
  if (Array.isArray(data)) {
    return data
      .map((item) => item?.updatedAt || item?.updated_at || "")
      .join(",");
  }
  if (data && typeof data === "object") {
    return data.updatedAt || data.updated_at || "";
  }
  return "";
}

function translateMiddleware(req, res, next) {
  const locale = req.query.lang;
  if (req.method !== "GET" || !SUPPORTED_LOCALES.includes(locale)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const freshnessToken = extractFreshnessToken(body);
    const cacheKey = `translate:${locale}:${req.originalUrl}:${freshnessToken}`;
    const ttl = freshnessToken
      ? CACHE_TTL_WITH_FRESHNESS_TOKEN
      : CACHE_TTL_WITHOUT_FRESHNESS_TOKEN;

    // Caching temporarily disabled — always translate live. Re-enable by
    // uncommenting the cacheService.get/.set calls below.
    // cacheService
    //   .get(cacheKey)
    //   .then(async (cached) => {
    //     if (cached) {
    //       return originalJson(JSON.parse(cached));
    //     }

    (async () => {
      try {
        const { status, message, ...rest } = body || {};
        // Controllers pass raw Sequelize model instances straight to res.json()
        // (Express's real res.json() handles that fine via JSON.stringify, which
        // calls each instance's toJSON()). translateContent's walk() recurses
        // directly over own properties instead, and Sequelize instances carry
        // circular internal metadata (association back-references, _options,
        // etc.) that isn't part of the actual data - walking it raw blows the
        // stack. Round-tripping through JSON first canonicalizes to the same
        // plain-object tree res.json() would have produced anyway.
        const plainRest = JSON.parse(JSON.stringify(rest));
        const translatedRest = await translateContent(plainRest, locale);
        const translatedBody = { status, message, ...translatedRest };

        // cacheService.set(cacheKey, JSON.stringify(translatedBody), ttl).catch((error) => {
        //   Logger.error(`Failed to cache translation for ${cacheKey}: ${error.message}`);
        // });

        return originalJson(translatedBody);
      } catch (error) {
        Logger.error(
          `Translation middleware error for ${req.originalUrl}: ${error.message}`,
        );
        originalJson(body); // fail open — serve English rather than break the page
      }
    })();
    //   })
    //   .catch((error) => {
    //     Logger.error(`Translation middleware error for ${req.originalUrl}: ${error.message}`);
    //     originalJson(body); // fail open — serve English rather than break the page
    //   });
  };

  next();
}

module.exports = translateMiddleware;
