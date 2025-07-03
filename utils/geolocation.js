// utils/geolocation.js
const axios = require("axios");
const { models } = require("../models/index");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 });

async function getStateFromIp(ip) {
  const cacheKey = `geo_${ip}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    
    return cached;
  }

  const isLocalhost = ip === "::1" || ip === "127.0.0.1" || ip === "1.1.1.1";
  const queryIp = isLocalhost ? "111.92.66.81" : ip;

  try {
    const response = await axios.get(
      `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${queryIp}`
    );
    

    const stateName = response.data.location?.state_prov || "Global";
    const state = await models.CareerStates.findOne({
      where: { state_name: stateName, is_active: true },
      attributes: ["id", "state_name"],
    });

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
    cache.set(cacheKey, result);
    return result;
  }
}

module.exports = { getStateFromIp };