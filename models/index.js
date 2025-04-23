const sequelize = require("../config/database");
const defineUser = require("./user");
const defineHeroBanner = require("./heroBanner");
const defineHomeStatistics = require("./homeStatistics");

const models = {
  User: defineUser(sequelize),
  HeroBanner: defineHeroBanner(sequelize),
  HomeStatistics: defineHomeStatistics(sequelize),
};

// Debug: Log model initialization
console.log("Models initialized:", Object.keys(models));
Object.keys(models).forEach((modelName) => {
  console.log(`${modelName} methods:`, Object.keys(models[modelName]));
});

module.exports = { sequelize, models };
