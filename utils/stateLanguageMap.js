// utils/stateLanguageMap.js
//
// Maps Indian state names (as returned by ipgeolocation.io's `state_prov`
// field) to the visitor's likely default locale. Only states whose majority
// regional language is one of the 7 supported locales get a non-English
// mapping — everywhere else (including Kerala, Indel Money's home state,
// where Malayalam isn't in the initial supported set) falls back to English.
const STATE_TO_LOCALE = {
  "tamil nadu": "ta",
  "puducherry": "ta",
  "andhra pradesh": "te",
  "telangana": "te",
  "karnataka": "kn",
  "maharashtra": "mr",
  "gujarat": "gu",
  "west bengal": "bn",
  "delhi": "hi",
  "nct of delhi": "hi",
  "uttar pradesh": "hi",
  "bihar": "hi",
  "madhya pradesh": "hi",
  "rajasthan": "hi",
  "haryana": "hi",
  "uttarakhand": "hi",
  "himachal pradesh": "hi",
  "jharkhand": "hi",
  "chhattisgarh": "hi",
  "punjab": "hi",
};

function localeFromStateName(stateName) {
  if (!stateName) return "en";
  return STATE_TO_LOCALE[stateName.trim().toLowerCase()] || "en";
}

module.exports = { localeFromStateName };
