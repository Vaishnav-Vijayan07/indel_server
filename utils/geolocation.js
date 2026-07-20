// utils/geolocation.js
const axios = require("axios");
const { models } = require("../models/index");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 });

async function getStateFromIp(ip) {
  const cacheKey = `geo_${ip}`;

  console.log("REQ IP", ip)

  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const isLocalhost = ip === "::1" || ip === "127.0.0.1" || ip === "1.1.1.1";
  const queryIp = isLocalhost ? "111.92.66.81" : ip;




  console.log("MYIP", queryIp)

  try {
    const response = await axios.get(`https://api.ipgeolocation.io/v2/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${queryIp}`);

    const stateName = response.data.location?.state_prov || "Global";
    const state = await models.CareerStates.findOne({
      where: { state_name: stateName, is_active: true },
      attributes: ["id", "state_name"],
    });


    console.log("STATE", state)

    const result = {
      stateId: state?.id || null,
      stateName: state?.state_name || "Global",
      latitude: parseFloat(response.data.latitude) || 0,
      longitude: parseFloat(response.data.longitude) || 0,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Geolocation error:", error.message);
    const result = { stateId: null, stateName: "Global", latitude: 0, longitude: 0 };
    // cache.set(cacheKey, result);
    return result;
  }
}

// Like getStateFromIp, but returns the raw state_prov from ipgeolocation.io
// directly rather than matching it against the CareerStates table (which is
// curated for career-page filtering, not a complete list of Indian states —
// matching against it here would make most states fall back to "Global").
// Shares the same cache/lookup logic, so it doesn't cost an extra API call
// for repeat visitors already cached under either key.
async function getRawStateNameFromIp(ip) {
  const cacheKey = `geo_raw_${ip}`;


  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const isLocalhost = ip === "::1" || ip === "127.0.0.1" || ip === "1.1.1.1";
  const queryIp = isLocalhost ? "122.165.232.124" : ip;

  try {
    const response = await axios.get(`https://api.ipgeolocation.io/v2/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${queryIp}`);
    const stateName = response.data.location?.state_prov || "Global";
    cache.set(cacheKey, stateName);
    return stateName;

  } catch (error) {
    console.error("Geolocation error:", error.message);
    return "Global";
  }
}

module.exports = { getStateFromIp, getRawStateNameFromIp };