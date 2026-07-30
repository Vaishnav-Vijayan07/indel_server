const { getRawStateNameFromIp, cache } = require("../utils/geolocation");
const { stateNameFromCoordinates } = require("../utils/statePolygonLookup");
const { sendLocaleResponse } = require("../utils/localeResponse");

class LocaleController {
  // GET /api/web/locale-detect — resolves a visitor's default locale from
  // their IP's Indian state. Called once by the client middleware on a
  // visitor's first unprefixed request; the client then persists the result
  // in the NEXT_LOCALE cookie so this isn't hit again on repeat visits.
  static async detectLocale(req, res) {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || req.socket.remoteAddress;

    const stateName = await getRawStateNameFromIp(ip);

    sendLocaleResponse(res, stateName);
  }

  // GET /api/web/locale-detect-gps?lat=..&lng=.. — resolves a visitor's
  // locale from browser-supplied GPS/WiFi coordinates instead of their IP.
  // IP geolocation is frequently wrong for Indian visitors (mobile carrier
  // CGNAT commonly resolves to the ISP's hub city, not the visitor's real
  // location); this endpoint is the accuracy upgrade the client calls
  // alongside /locale-detect once it has the visitor's actual coordinates.
  static async detectLocaleFromCoordinates(req, res) {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    const isValid = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
    if (!isValid(lat, -90, 90) || !isValid(lng, -180, 180)) {
      return res.status(400).json({ status: "error", message: "lat and lng are required" });
    }

    // Rounded to ~111m grid cells - tight enough to stay within a single
    // Indian state near borders, coarse enough that a visitor's naturally
    // jittery GPS reading still hits the cache on repeat lookups.
    const latR = lat.toFixed(3);
    const lngR = lng.toFixed(3);
    const cacheKey = `geo_point_${latR}_${lngR}`;

    let stateName = cache.get(cacheKey);
    if (stateName === undefined) {
      stateName = stateNameFromCoordinates(lat, lng);
      cache.set(cacheKey, stateName);
    }

    sendLocaleResponse(res, stateName);
  }
}

module.exports = LocaleController;
