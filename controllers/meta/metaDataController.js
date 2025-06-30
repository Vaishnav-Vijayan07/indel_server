const { models, sequelize } = require("../../models/index");
const cacheService = require("../../services/cacheService");
const logger = require("../../services/logger");

const typeToDbMap = {
  home: models.HomePageContent,
  about: models.AboutPageContent,
  goldloan: models.GoldloanContent,
  msme: models.MsmeLoanContent,
  cdloan: models.CdLoanContent,
  lap: models.LoanAgainstPropertyContent,
  career: models.CareersContent,
  gallery: models.GalleryPageContent,
};

class MetaDataController {
  static async getMetaData(req, res, next) {
    const { page } = req.query;
    if (!typeToDbMap[page]) {
      return res.status(404).json({ error: "Page type not found" });
    }
    const cacheKey = `metaData:${page}`;
    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${page}`);
        return res.status(200).json(JSON.parse(cachedData));
      }
      const metaData = await typeToDbMap[page].findOne({
        attributes: ["id", "meta_title", "meta_description", "meta_keywords"],
      });
      if (!metaData) {
        return res.status(404).json({ error: "Meta data not found" });
      }
      await cacheService.set(cacheKey, JSON.stringify(metaData));
      console.log(`Cache miss for ${page}, setting cache`);
      return res.json({ status: "success", metaData });
    } catch (error) {
      logger.error(`Error fetching meta data for ${page}: ${error.message}`);
      next(error);
    }
  }
}
module.exports = MetaDataController;
