const { models, sequelize } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");
const { Sequelize, where, Op } = require("sequelize");
const { getStateFromIp } = require("../utils/geolocation");

class FaqController {
  static async getFaqData(req, res, next) {
    // Get type from query parameters or body
    const type = req.query.type || req.body.type || "home";

    // 1. Try to get stateId and stateName from session
    let stateId = req.session?.stateId || null;
    let stateName = req.session?.stateName || "Global";

    console.log("Ip address ===>", stateId, stateName);

    // 2. If not in session, call geolocation API and store in session
    if (!stateId) {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
      try {
        const geo = await getStateFromIp(ip);
        stateId = geo.stateId;
        stateName = geo.stateName;
        // Store in session for future requests
        req.session.stateId = stateId;
        req.session.stateName = stateName;
      } catch (error) {
        console.error("Failed to resolve geolocation:", error.message);
      }
    }

    // Determine which model to use based on type
    let faqModel;
    let modelName;

    switch (type.toLowerCase()) {
      case "home":
        faqModel = models.HomeFaq;
        modelName = "HomeFaq";
        break;
      case "goldloan":
        faqModel = models.GoldLoanFaq;
        modelName = "GoldloanFaq";
        break;
      case "contact":
        faqModel = models.ContactFaq;
        modelName = "ContactFaq";
        break;
      case "msme":
        faqModel = models.MsmeLoanFaq;
        modelName = "MsmeLoanFaq";
        break;
      default:
        return next(new CustomError("Invalid FAQ type. Use 'home', 'goldloan', or 'contact'", 400));
    }

    const cacheKey = `web${modelName}_${stateId || "null"}`;
    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      // Fetch FAQs based on location and type
      const faqs = await faqModel
        .findAll({
          where: {
            is_active: true,
            [Op.or]: [{ state_id: stateId || null }, { state_id: null }],
          },
          order: [["order", "ASC"]],
        })
        .catch((err) => {
          console.error(`Failed to fetch ${modelName}:`, err.message);
          throw err;
        });

      await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);

      res.json({ status: "success", faqs });
    } catch (error) {
      console.error(`Error fetching ${modelName} data:`, error.message);
      next(new CustomError(`Failed to fetch ${modelName} data`, 500, error.message));
    }
  }
}

module.exports = FaqController;