const sequelize = require("../config/database");
const defineUser = require("./user");
const defineHeroBanner = require("./homePage/heroBanner");
const defineHomeStatistics = require("./homePage/homeStatistics");
const defineHomePageContent = require("./homePage/HomePageContent");
const defineHomeLoanStep = require("./homePage/homeLoanStep");
const defineHomeFaq = require("./homePage/homeFaq");
const defineSmartMoneyDeals = require("./homePage/smartMoneyDeals");
const defineAboutBanner = require("./about/aboutBanner");
const defineAboutLifeAtIndelGallery = require("./about/aboutLifeAtIndelGallery");
const defineAboutQuickLinks = require("./about/aboutQuickLinks");
const defineAboutPageContent = require("./about/aboutPageContent");
const defineAboutServiceGallery = require("./about/aboutServiceGallery");
const defineAboutMessageTeam = require("./about/aboutMessageFromTeam");
const defineAboutStatistics = require("./about/aboutStats");
const defineAboutAccolades = require("./about/aboutAccolades");
const ManagementTeams = require("./management/managementTeams");
const ManagementTeamContent = require("./management/managementTeamContent");
const DeptPartners = require("./debt/deptPartners");
const DebtPartnersContent = require("./debt/debtPartnersContent");
const ContactContent = require("./contact/contactContent");
const ContactFaq = require("./contact/contactFaq");
const ContactOffice = require("./contact/contactOffice");

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
  ManagementTeams: ManagementTeams(sequelize),
  ManagementTeamContent: ManagementTeamContent(sequelize),
  DeptPartners: DeptPartners(sequelize),
  DebtPartnersContent: DebtPartnersContent(sequelize),
  ContactContent: ContactContent(sequelize),
  ContactFaq: ContactFaq(sequelize),
  ContactOffice: ContactOffice(sequelize),
  AboutAccolades: defineAboutAccolades(sequelize),
};

// Debug: Log model initialization
console.log("Models initialized:", Object.keys(models));
Object.keys(models).forEach((modelName) => {
  console.log(`${modelName} methods:`, Object.keys(models[modelName]));
});

module.exports = { sequelize, models };
