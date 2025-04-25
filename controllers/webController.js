const { models } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");

class WebController {
  static async getHomeData(req, res, next) {
    try {
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
        data.pageContent = await models.HomePageContent.findAll();
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
}

module.exports = WebController;
