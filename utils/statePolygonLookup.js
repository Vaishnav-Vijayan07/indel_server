// utils/statePolygonLookup.js
//
// Reverse-geocodes a lat/lng (e.g. from the browser's Geolocation API) to an
// Indian state name via point-in-polygon lookup against a vendored boundary
// dataset (see ../data/geo/india-states.README.md for provenance/license).
// This exists because IP-based geolocation (see ./geolocation.js) is
// frequently wrong for Indian visitors - mobile carrier CGNAT commonly
// resolves an IP to the ISP's hub city rather than the visitor's real
// location - whereas GPS/WiFi-derived coordinates reflect where the device
// actually is.
const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const geojson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/geo/india-states.geojson"), "utf8")
);

// Precomputed once at module load (not per-request): each state's centroid,
// used only by the nearest-match fallback below.
const states = geojson.features.map((feature) => ({
  stateName: feature.properties.name,
  feature,
  centroid: turf.centroid(feature),
}));

// Generous India bounding box (mainland + islands), used to gate the
// nearest-centroid fallback so a fix that's actually in Sri Lanka, Nepal,
// Pakistan, etc. doesn't get force-matched to whichever Indian state happens
// to be closest.
const INDIA_BOUNDS = { minLat: 6, maxLat: 37.5, minLng: 68, maxLng: 97.5 };

function isWithinIndiaBounds(lat, lng) {
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
}

// Returns the Indian state name for a given coordinate, or null if it can't
// be resolved (outside India entirely, or any internal failure - this fails
// open exactly like getRawStateNameFromIp does for the IP path).
function stateNameFromCoordinates(lat, lng) {
  try {
    // turf points are [lng, lat], the opposite of the (lat, lng) argument
    // order here - easy to transpose these, so this is spelled out.
    const point = turf.point([lng, lat]);

    for (const state of states) {
      if (turf.booleanPointInPolygon(point, state.feature)) {
        return state.stateName;
      }
    }

    if (!isWithinIndiaBounds(lat, lng)) {
      return null;
    }

    // Inside India's bounding box but missed every polygon - likely GPS
    // drift near a coastline or state border. Fall back to the nearest
    // state's centroid rather than returning null outright.
    let nearest = null;
    let nearestDistance = Infinity;
    for (const state of states) {
      const distance = turf.distance(point, state.centroid);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = state.stateName;
      }
    }
    return nearest;
  } catch (error) {
    console.error("State polygon lookup error:", error.message);
    return null;
  }
}

module.exports = { stateNameFromCoordinates };
