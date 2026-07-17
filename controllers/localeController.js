const { getRawStateNameFromIp } = require("../utils/geolocation");
const { localeFromStateName } = require("../utils/stateLanguageMap");

class LocaleController {
  // GET /api/web/locale-detect — resolves a visitor's default locale from
  // their IP's Indian state. Called once by the client middleware on a
  // visitor's first unprefixed request; the client then persists the result
  // in the NEXT_LOCALE cookie so this isn't hit again on repeat visits.
  static async detectLocale(req, res) {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || req.socket.remoteAddress;

    const stateName = await getRawStateNameFromIp(ip);

    console.log("LOCATION IP STATENAME", stateName)
    const locale = localeFromStateName(stateName);

    res.json({ status: "success", data: { locale, stateName } });
  }
}

module.exports = LocaleController;
