const xlsx = require("xlsx");
const { Op } = require("sequelize");
const { models } = require("../models/index");

async function importBranchesFromXlsx(filePath, sequelize) {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    const Branches = models.Branches;

    // Map Excel columns to database fields
    const branchData = data.map((row) => ({
      branch_code: row["Branch Code"]?.toString(),
      name: row["Name of the Branch"],
      state: parseInt(row["State"]),
      district: parseInt(row["DISTRICT"]),
      address_1: row["Address1"],
      address_2: row["Address2"],
      address_3: row["Address3"],
      latitude: parseFloat(row["Latitude"]),
      longitude: parseFloat(row["Longitude"]),
      pincode: row["Pincode"]?.toString(),
      mobile_no: row["Number"]?.toString(),
      is_active: true,
    }));

    // Validate required fields
    for (const branch of branchData) {
      if (!branch.name || !branch.state || !branch.district) {
        throw new Error(`Missing required fields in branch: ${JSON.stringify(branch)}`);
      }
    }

    // Bulk create branches with update on duplicate
    await Branches.bulkCreate(branchData, {
      updateOnDuplicate: [
        "name",
        "state",
        "district",
        "address_1",
        "address_2",
        "address_3",
        "latitude",
        "longitude",
        "pincode",
        "mobile_no",
        "is_active",
      ],
    });

    
    return { success: true, count: branchData.length };
  } catch (error) {
    console.error("Error importing branches:", error);
    throw error;
  }
}

module.exports = { importBranchesFromXlsx };
