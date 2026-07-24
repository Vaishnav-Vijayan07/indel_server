// utils/stateLanguageMap.js
//
// Maps Indian state/UT names (as returned by ipgeolocation.io's `state_prov`
// field) to the visitor's likely default locale. States/UTs whose majority
// language isn't one of the 20 the client supports (Khasi, Garo, Mizo, Naga
// languages, Ladakhi, etc.) deliberately have no entry and fall through to
// the "en" default below — same treatment already used for excluding
// Bodo/Kashmiri from the language list itself. A few UTs/states without one
// clean-cut majority language (J&K, Tripura, Chandigarh) get a best-guess
// mapping per official-language/demographic-majority data rather than being
// left unmapped.
const STATE_TO_LOCALE = {
  // Tamil
  "tamil nadu": "ta",
  "puducherry": "ta",
  "pondicherry": "ta", // pre-2006 name, in case an older geo dataset uses it

  // Telugu
  "andhra pradesh": "te",
  "telangana": "te",

  // Kannada
  "karnataka": "kn",

  // Malayalam
  "kerala": "ml",
  "lakshadweep": "ml",

  // Marathi
  "maharashtra": "mr",

  // Gujarati
  "gujarat": "gu",

  // Bengali
  "west bengal": "bn",
  "tripura": "bn", // demographic majority per post-Partition migration, despite Kokborok being indigenous

  // Konkani — Goa's official language
  "goa": "kok",

  // Odia
  "odisha": "or",
  "orissa": "or", // pre-2011 name

  // Punjabi
  "punjab": "pa",

  // Nepali — Sikkim's majority and an official language
  // "sikkim": "ne",

  // Manipuri / Meitei — Manipur's majority language (Imphal valley)
  // "manipur": "mni-Mtei",

  // Assamese
  "assam": "as",

  // Urdu — J&K's long-standing sole official/lingua-franca language, even
  // though it isn't the population's mother tongue (Kashmiri, unsupported)
  "jammu and kashmir": "ur",

  // Hindi
  "delhi": "hi",
  "nct of delhi": "hi",
  "uttar pradesh": "hi",
  "bihar": "hi",
  "madhya pradesh": "hi",
  "rajasthan": "hi",
  "haryana": "hi",
  "uttarakhand": "hi",
  "uttaranchal": "hi", // pre-2007 name
  "himachal pradesh": "hi",
  "jharkhand": "hi",
  "chhattisgarh": "hi",
  "chandigarh": "hi", // plurality mother tongue per census, despite Punjabi's symbolic association

  // Deliberately unmapped — falls through to "en":
  //   Arunachal Pradesh, Meghalaya, Mizoram, Nagaland, Ladakh: local
  //   Tibeto-Burman/Austroasiatic languages aren't in our supported set.
};

function localeFromStateName(stateName) {
  if (!stateName) return "en";
  return STATE_TO_LOCALE[stateName.trim().toLowerCase()] || "en";
}

module.exports = { localeFromStateName };
