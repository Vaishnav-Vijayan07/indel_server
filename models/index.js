const sequelize = require('../config/database');
const defineUser = require('./user');
const defineHeroBanner = require('./homePage/heroBanner');
const defineHomeStatistics = require('./homePage/homeStatistics');
const defineHomePageContent = require('./homePage/HomePageContent');
const defineHomeLoanStep = require('./homePage/homeLoanStep');
const defineHomeFaq = require('./homePage/homeFaq');
const defineSmartMoneyDeals = require('./homePage/smartMoneyDeals');
const defineAboutBanner = require('./about/aboutBanner');
const defineAboutLifeAtIndelGallery = require('./about/aboutLifeAtIndelGallery');
const defineAboutQuickLinks = require('./about/aboutQuickLinks');
const defineAboutPageContent = require('./about/aboutPageContent');
const defineAboutServiceGallery = require('./about/aboutServiceGallery');
const defineAboutMessageTeam = require('./about/aboutMessageFromTeam');
const defineAboutStatistics = require('./about/aboutStats');

const models = {
  User: defineUser(sequelize),
  HeroBanner: defineHeroBanner(sequelize),
  HomeStatistics: defineHomeStatistics(sequelize),
  HomePageContent: defineHomePageContent(sequelize),
  HomeLoanStep: defineHomeLoanStep(sequelize),
  HomeFaq: defineHomeFaq(sequelize),
  SmartMoneyDeals: defineSmartMoneyDeals(sequelize),
  AboutBanner: defineAboutBanner(sequelize),
  AboutLifeAtIndelGallery: defineAboutLifeAtIndelGallery(sequelize),
  AboutQuickLinks: defineAboutQuickLinks(sequelize),
  AboutPageContent: defineAboutPageContent(sequelize),
  AboutServiceGallery: defineAboutServiceGallery(sequelize),
  AboutMessageFromTeam: defineAboutMessageTeam(sequelize),
  AboutStatistics: defineAboutStatistics(sequelize),
};

// Debug: Log model initialization
console.log('Models initialized:', Object.keys(models));
Object.keys(models).forEach((modelName) => {
  console.log(`${modelName} methods:`, Object.keys(models[modelName]));
});

module.exports = { sequelize, models };