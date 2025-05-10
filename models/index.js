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
const defineHistoryPageContent = require("./history/historyContent");
const defineHistoryImages = require("./history/historyImages");
const defineHistoryInceptionsYears = require("./history/historyInceptionsYears");
const defineIndelValuesContent = require("./indelValues/indelValueContent");
const defineIndelValues = require("./indelValues/indelValues");
const defineApproachPropositions = require("./indelValues/approachProposition");
const defineShadesOfIndelContent = require("./shadesOfIndel/shadesOfIndelContent");
const defineDifferentShades = require("./shadesOfIndel/differentShades");
const defineServiceContent = require("./services/servicesContent");
const defineServices = require("./services/services");
const defineServiceBenefits = require("./services/serviceBenefits");
const defineGoldloanContent = require("./goldloan/goldloanContent");
const defineGoldloanBannerFeatures = require("./goldloan/bannerFeatures");

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
  HistoryPageContent: defineHistoryPageContent(sequelize),
  HistoryImages: defineHistoryImages(sequelize),
  HistoryInceptionsYears: defineHistoryInceptionsYears(sequelize),
  IndelValueContent: defineIndelValuesContent(sequelize),
  IndelValues: defineIndelValues(sequelize),
  ApproachPropositions: defineApproachPropositions(sequelize),
  ShadesOfIndelContent: defineShadesOfIndelContent(sequelize),
  DifferentShades: defineDifferentShades(sequelize),
  ServiceContent: defineServiceContent(sequelize),
  Services: defineServices(sequelize),
  ServiceBenefit: defineServiceBenefits(sequelize),
  GoldloanContent: defineGoldloanContent(sequelize),
  GoldloanBannerFeatures: defineGoldloanBannerFeatures(sequelize),
};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

Object.keys(models).forEach((modelName) => {
  console.log(`${modelName} methods:`, Object.keys(models[modelName]));
});

module.exports = { sequelize, models };
