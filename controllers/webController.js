const { models } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");
const { Sequelize } = require("sequelize");

class WebController {
  static async getHomeData(req, res, next) {
    try {
      await CacheService.invalidate("webHomeData");
      const cacheKey = "webHomeData";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        logger.info("Serving home data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const data = {};
      try {
        data.heroBanner = await models.HeroBanner.findAll();
        logger.debug("Fetched heroBanner");
      } catch (err) {
        logger.error("Failed to fetch heroBanner", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.faqs = await models.HomeFaq.findAll({ order: [["order", "ASC"]] });
        logger.debug("Fetched faqs");
      } catch (err) {
        logger.error("Failed to fetch faqs", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.loanSteps = await models.HomeLoanStep.findAll({ order: [["order", "ASC"]] });
        logger.debug("Fetched loanSteps");
      } catch (err) {
        logger.error("Failed to fetch loanSteps", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.homeStatistics = await models.HomeStatistics.findAll({
          order: [["sort_order", "ASC"]],
        });
        logger.debug("Fetched loanSteps");
      } catch (err) {
        logger.error("Failed to fetch loanSteps", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        const homePageData = await models.HomePageContent.findAll();
        data.pageContent = homePageData[0];
        logger.debug("Fetched pageContent");
      } catch (err) {
        logger.error("Failed to fetch pageContent", { error: err.message, stack: err.stack });
        throw err;
      }

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched home data");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching home data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch home data", 500, error.message));
    }
  }

  static async aboutData(req, res, next) {
    const cacheKey = "webAboutData";

    try {
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving home data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [aboutBanner, aboutContent, lifeAtIndelImages, quickLinks, teamMessages, serviceImages, statsData, accolades] = await Promise.all([
        models.AboutBanner.findAll(),
        models.AboutPageContent.findAll(),
        models.AboutLifeAtIndelGallery.findAll(),
        models.AboutQuickLinks.findAll(),
        models.AboutMessageFromTeam.findAll(),
        models.AboutServiceGallery.findAll(),
        models.AboutStatistics.findAll(),
        models.AboutAccolades.findAll(),
      ]);

      const data = {
        aboutBanner,
        aboutContent: aboutContent[0] || null,
        lifeAtIndelImages,
        quickLinks,
        teamMessages,
        serviceImages,
        statsData,
        accolades,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched about data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching about data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch about data", 500, error.message));
    }
  }

  static async mangementData(req, res, next) {
    const cacheKey = "webManagementData";

    try {
      // await CacheService.invalidate("webManagementData");
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving management data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, teams] = await Promise.all([models.ManagementTeamContent.findAll(), models.ManagementTeams.findAll()]);

      const data = {
        content: content[0] || null,
        teams,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched management data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching management data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch management data", 500, error.message));
    }
  }

  static async partnersData(req, res, next) {
    const cacheKey = "webPartnersData";

    try {
      await CacheService.invalidate("webPartnersData");
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving partners data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, debtPartners] = await Promise.all([models.DebtPartnersContent.findAll(), models.DeptPartners.findAll()]);

      const data = {
        content: content[0] || null,
      };

      const partnersData = {
        debtPartners,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched partners data from DB");
      res.json({ status: "success", data, partnersData });
    } catch (error) {
      logger.error("Error fetching partners data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch partners data", 500, error.message));
    }
  }

  static async contactData(req, res, next) {
    const cacheKey = "webContactData";

    try {
      await CacheService.invalidate("webContactData");
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving contact data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, faqs, officeContacts] = await Promise.all([
        models.ContactContent.findAll({
          attributes: {
            exclude: ["createdAt", "updatedAt", "branch_locator_title", "branch_locator_description"], // exclude timestamps
            include: [
              [Sequelize.col("branch_locator_title"), "branch_section_title"],
              [Sequelize.col("branch_locator_description"), "branch_section_description"],
            ],
          },
        }),
        models.ContactFaq.findAll(),
        models.ContactOffice.findAll(),
      ]);

      const data = {
        content: content[0] || null,
        faqs,
        officeContacts,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched contact data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching contact data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch contact data", 500, error.message));
    }
  }

  static async historyData(req, res, next) {
    const cacheKey = "webHistoryData";

    try {
      await CacheService.invalidate("webHistoryData");
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving history data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, images, inceptions] = await Promise.all([
        models.HistoryPageContent.findAll(),
        models.HistoryImages.findAll(),
        models.HistoryInceptionsYears.findAll(),
      ]);

      const data = {
        content: content[0] || null,
        images,
        inceptions,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched history data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching history data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch history data", 500, error.message));
    }
  }
}

module.exports = WebController;
