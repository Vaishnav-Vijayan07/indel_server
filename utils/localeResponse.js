// utils/localeResponse.js
//
// Shared response shape for both locale-detection endpoints (IP-based and
// GPS-based) - keeps the locale/stateName JSON envelope identical so the
// frontend's single result?.data?.locale read works against either.
const { localeFromStateName } = require("./stateLanguageMap");

function sendLocaleResponse(res, stateName, extra = {}) {
  const locale = localeFromStateName(stateName);
  res.json({ status: "success", data: { locale, stateName, ...extra } });
}

module.exports = { sendLocaleResponse };
