const { getAllStates, getDistricts } = require("india-state-district");

const { models: dbModels, sequelize } = require("../models");
const { CareerStates, Districts } = dbModels;

const normalize = (text) => text.toLowerCase().trim().replace(/\s+/g, " ");

async function importDistricts() {
  const transaction = await sequelize.transaction();

  try {
    console.log("District import started");

    const dbCareerStates = await CareerStates.findAll({
      attributes: ["id", "state_name"],
      raw: true,
      transaction,
    });

    const stateLookup = new Map();
    dbCareerStates.forEach((state) => {
      stateLookup.set(normalize(state.state_name), state.id);
    });

    const existingDistricts = await Districts.findAll({
      attributes: ["district_name", "state_id"],
      raw: true,
      transaction,
    });

    const existingSet = new Set(
      existingDistricts.map(
        (item) => `${normalize(item.district_name)}_${item.state_id}`,
      ),
    );

    const insertData = [];

    // getAllStates() -> [{ code: "AP", name: "Andhra Pradesh" }, ...]
    const indiaStates = getAllStates();

    for (const state of indiaStates) {
      const stateId = stateLookup.get(normalize(state.name));
      if (!stateId) continue;

      // getDistricts(code) -> plain array of district name strings
      const districts = getDistricts(state.code);

      for (const districtName of districts) {
        const key = `${normalize(districtName)}_${stateId}`;
        if (existingSet.has(key)) continue;

        insertData.push({
          district_name: districtName,
          state_id: stateId,
          is_active: true,
        });
      }
    }

    if (insertData.length) {
      await Districts.bulkCreate(insertData, {
        transaction,
        ignoreDuplicates: true,
      });
    }

    await transaction.commit();
    console.log(`${insertData.length} districts inserted`);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
}

module.exports = importDistricts;
