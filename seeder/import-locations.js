const { getAllPincodes } = require("indian-pincodes");

const { models: dbModels, sequelize } = require("../models");
const { CareerStates, Districts, CareerLocations } = dbModels;

const normalize = (text) => text.toLowerCase().trim().replace(/\s+/g, " ");

async function importLocations() {
  const transaction = await sequelize.transaction();

  try {
    console.log("Location import started");

    // Step 1: Load all states and districts, build state+district lookup map
    const dbCareerStates = await CareerStates.findAll({
      attributes: ["id", "state_name"],
      raw: true,
      transaction,
    });

    const dbDistricts = await Districts.findAll({
      attributes: ["id", "district_name", "state_id"],
      raw: true,
      transaction,
    });

    // Map keyed by "${normalize(state_name)}_${normalize(district_name)}" -> district_id
    const districtLookup = new Map();
    // Map keyed by district_id -> {state_name, district_name} for reverse lookups
    const districtReverseLookup = new Map();

    dbDistricts.forEach((district) => {
      const state = dbCareerStates.find((s) => s.id === district.state_id);
      if (state) {
        const key = `${normalize(state.state_name)}_${normalize(
          district.district_name,
        )}`;
        districtLookup.set(key, district.id);
        districtReverseLookup.set(district.id, {
          state_name: state.state_name,
          district_name: district.district_name,
        });
      }
    });

    // Step 2: Load all existing locations and build a Set of normalized keys
    const existingLocations = await CareerLocations.findAll({
      attributes: ["location_name", "district_id"],
      raw: true,
      transaction,
    });

    const existingSet = new Set(
      existingLocations
        .map((item) => {
          // Skip rows with null district_id (can't be keyed to a state/district)
          if (!item.district_id) {
            return null;
          }
          const districtInfo = districtReverseLookup.get(item.district_id);
          // Skip if district_id doesn't resolve to a known district
          if (!districtInfo) {
            return null;
          }
          return `${normalize(districtInfo.state_name)}_${normalize(
            districtInfo.district_name,
          )}_${normalize(item.location_name)}`;
        })
        .filter((key) => key !== null),
    );

    // Step 3: Get all pincodes from the package
    const allPincodes = getAllPincodes();
    console.log(`Total pincodes from package: ${allPincodes.length}`);

    // Log first record to debug field names if needed
    if (allPincodes.length > 0) {
      console.log("Sample pincode record:", allPincodes[0]);
    }

    // Step 4: Build candidate locations, deduping in-memory
    const candidateSet = new Set(); // To avoid duplicates within new insertions
    const insertData = [];

    for (const pincode of allPincodes) {
      // Extract location name and state/district info
      // The field names from indian-pincodes package typically include:
      // officeName, pincode, taluk, district, state, region, division, circle
      const locationName = pincode.officeName || pincode.name;
      const stateName = pincode.state;
      const districtName = pincode.district;

      if (!locationName || !stateName || !districtName) {
        continue;
      }

      // Resolve district_id via state+district lookup
      const districtKey = `${normalize(stateName)}_${normalize(districtName)}`;
      const districtId = districtLookup.get(districtKey);

      if (!districtId) {
        continue; // Skip if district not found in DB
      }

      // Build deduplication key using state + district + location names
      const key = `${normalize(stateName)}_${normalize(districtName)}_${normalize(locationName)}`;

      // Skip if already in DB or already in current batch
      if (existingSet.has(key) || candidateSet.has(key)) {
        continue;
      }

      candidateSet.add(key);
      insertData.push({
        location_name: locationName,
        district_id: districtId,
        is_active: true,
      });
    }

    console.log(`New locations to insert: ${insertData.length}`);

    // Step 5: BulkCreate with ignoreDuplicates as secondary guard
    if (insertData.length > 0) {
      await CareerLocations.bulkCreate(insertData, {
        transaction,
        ignoreDuplicates: true,
      });
    }

    await transaction.commit();
    console.log(
      `${insertData.length} locations inserted, ${existingLocations.length} existing locations skipped`,
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error during location import:", error);
    throw error;
  }
}

module.exports = importLocations;
