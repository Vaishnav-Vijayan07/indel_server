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
  testimonials: models.TestimonialPageContent,
  management: models.ManagementTeamContent,
  directors: models.DirectorsContent,
  partners: models.DebtPartnersContent,
  history: models.HistoryPageContent,
  shades: models.ShadesOfIndelContent,
  indelValues: models.IndelValueContent,
  services: models.ServiceContent,
  award: models.AwardPageContent,
  blog: models.BlogPageContent,
  blogItem: models.Blogs,
  newsItem: models.News,
  news: models.NewsPageContent,
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
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }
      const metaData = await typeToDbMap[page].findOne({
        attributes: ["id", "meta_title", "meta_description", "meta_keywords"],
      });
      if (!metaData) {
        return res.status(404).json({ error: "Meta data not found" });
      }
      await cacheService.set(cacheKey, JSON.stringify(metaData));

      res.status(200).json({ status: "success", data: metaData });
    } catch (error) {
      logger.error(`Error fetching meta data for ${page}: ${error.message}`);
      next(error);
    }
  }

  static async getMetaForSlug(req, res, next) {
    const { page, slug } = req.query;
    if (!typeToDbMap[page]) {
      return res.status(404).json({ error: "Page type not found" });
    }
    try {
      const metaData = await typeToDbMap[page].findOne({
        attributes: ["id", "meta_title", "meta_description", "meta_keywords", "image", "image_alt", "slug"],
        where: { slug },
      });
      if (!metaData) {
        return res.status(404).json({ error: "Meta data not found" });
      }
      const itemId = metaData.id;
      const cacheKey = `metaData:${page}:${itemId}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log("Serving meta data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }
      await cacheService.set(cacheKey, JSON.stringify(metaData));
      console.log("Serving meta data from database");
      res.status(200).json({ status: "success", data: metaData });
    } catch (error) {
      logger.error(`Error fetching meta data for ${page}: ${error.message}`);
      next(error);
    }
  }
}
module.exports = MetaDataController;
