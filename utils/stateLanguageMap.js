// utils/stateLanguageMap.js
//
// Maps Indian state/UT names (as returned by ipgeolocation.io's `state_prov`
// field) to the visitor's likely default locale. The client supports 15
// Indian languages plus English (as, bn, gu, hi, kn, kok, mai, ml, mr, or,
// pa, sat, ta, te, ur — see TRANSLATION_LANGUAGES in
// client/src/components/layout/header/TranslatorDropdown.js). Sikkim
// (Nepali/ne) and Manipur (Meitei/mni-Mtei) are commented out there too, so
// they're deliberately left unmapped here as well and fall through to the
// "en" default below. Arunachal Pradesh, Meghalaya, Mizoram, Nagaland, and
// Ladakh use local languages (Khasi, Garo, Mizo, Naga languages, Ladakhi/
// Bhoti, etc.) that were never Eighth Schedule candidates in the first
// place, so they're unmapped for the same reason. A few UTs/states without
// one clean-cut majority language (J&K, Tripura, Chandigarh) get a
// best-guess mapping per official-language/demographic-majority data rather
// than being left unmapped.

const STATE_TO_LOCALE = {
  // Tamil
  "tamil nadu": "ta",
  puducherry: "ta",
  pondicherry: "ta", // pre-2006 name, in case an older geo dataset uses it

  // Telugu
  "andhra pradesh": "te",
  telangana: "te",

  // Kannada
  karnataka: "kn",

  // Malayalam
  kerala: "ml",
  lakshadweep: "ml",

  // Marathi
  maharashtra: "mr",

  // Gujarati
  gujarat: "gu",

  // Bengali
  "west bengal": "bn",
  tripura: "bn", // demographic majority per post-Partition migration, despite Kokborok being indigenous

  // Konkani — Goa's official language
  goa: "kok",

  // Odia
  odisha: "or",
  orissa: "or", // pre-2011 name

  // Punjabi
  punjab: "pa",

  // Nepali — Sikkim's majority and an official language
  // "sikkim": "ne",

  // Manipuri / Meitei — Manipur's majority language (Imphal valley)
  // "manipur": "mni-Mtei",

  // Assamese
  assam: "as",

  // Urdu — J&K's long-standing sole official/lingua-franca language, even
  // though it isn't the population's mother tongue (Kashmiri, unsupported)
  "jammu and kashmir": "ur",

  // Hindi
  delhi: "hi",
  "nct of delhi": "hi",
  "uttar pradesh": "hi",
  bihar: "hi",
  "madhya pradesh": "hi",
  rajasthan: "hi",
  haryana: "hi",
  uttarakhand: "hi",
  uttaranchal: "hi", // pre-2007 name
  "himachal pradesh": "hi",
  jharkhand: "hi",
  chhattisgarh: "hi",
  chandigarh: "hi", // plurality mother tongue per census, despite Punjabi's symbolic association
  "dadra and nagar haveli and daman and diu": "gu",
  "andaman and nicobar": "hi",

  // Deliberately unmapped — falls through to "en": Sikkim, Manipur,
  // Arunachal Pradesh, Meghalaya, Mizoram, Nagaland, Ladakh (see header).
};

function localeFromStateName(stateName) {
  if (!stateName) return "en";
  return STATE_TO_LOCALE[stateName.trim().toLowerCase()] || "en";
}

module.exports = { localeFromStateName };
