const { models, sequelize } = require("../../models/index");
const cacheService = require("../../services/cacheService");
const logger = require("../../services/logger");

const typeToDbMap = {
  home: models.HomePageContent,
  about: models.AboutPageContent,
  goldloan: models.GoldloanContent,
  msme: models.MsmeLoanContent,
  cdloan: models.CdLoanContent,
  lap: models.LapContent,
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
  contact: models.ContactContent,
  gallery: models.GalleryPageContent,
  blog: models.BlogPageContent,
  blogItem: models.Blogs,
  csrItem: models.IndelCares,
  indelcares: models.IndelCaresContent,
  newsItem: models.News,
  news: models.NewsPageContent,
  branchlocator: models.BranchLocatorPageContents,
  ncd: models.NcdPageContent,
};

class MetaDataController {
  static async getMetaData(req, res, next) {
    const { page } = req.query;

    console.log(`Fetching meta data for page: ${page}`, typeToDbMap[page]);

    // Validate page
    if (!typeToDbMap[page] && page !== "career" && page !== "listings") {
      return res.status(404).json({ error: "Page type not found" });
    }

    // Handle career & listings separately
    if (page === "career" || page === "listings") {
      try {
        const metaData = await models.CareerMeta.findOne({
          attributes: ["id", "meta_title", "meta_description", "meta_keywords"],
          where: { type: page },
        });

        if (!metaData) {
          return res.status(404).json({ error: "Meta data not found" });
        }

        console.log(`Fetching ${page} data from DB`);
        return res.status(200).json({ status: "success", data: metaData });
      } catch (error) {
        logger.error(`Error fetching meta data for ${page}: ${error.message}`);
        return next(error);
      }
    }

    // General page meta
    try {
      const metaData = await typeToDbMap[page].findOne({
        attributes: ["id", "meta_title", "meta_description", "meta_keywords"],
      });

      if (!metaData) {
        return res.status(404).json({ error: "Meta data not found" });
      }

      return res.status(200).json({ status: "success", data: metaData });
    } catch (error) {
      logger.error(`Error fetching meta data for ${page}: ${error.message}`);
      next(error);
    }
  }

  // Fetch meta for slug (cache removed)
  static async getMetaForSlug(req, res, next) {
    const { page, slug } = req.query;

    if (!typeToDbMap[page]) {
      return res.status(404).json({ error: "Page type not found" });
    }

    try {
      const metaData = await typeToDbMap[page].findOne({
        attributes: ["id", "meta_title", "meta_description", "meta_keywords", "image", "image_alt", "slug"],
        where: { slug },
        logging: console.log,
      });

      if (!metaData) {
        return res.status(404).json({ error: "Meta data not found" });
      }

      console.log("Fetching meta data from database");
      return res.status(200).json({ status: "success", data: metaData });
    } catch (error) {
      logger.error(`Error fetching meta data for ${page}: ${error.message}`);
      next(error);
    }
  }
}

module.exports = MetaDataController;
