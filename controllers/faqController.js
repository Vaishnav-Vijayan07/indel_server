const { models } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");
const { Op } = require("sequelize");
const { getStateFromIp } = require("../utils/geolocation");

class FaqController {
  static async getFaqData(req, res, next) {
    try {
      // 1. Get type from query or body
      const type = (req.query.type || req.body.type || "home").toLowerCase();

      // 2. Try to get stateId and stateName from session
      let stateId = req.session?.stateId || null;
      let stateName = req.session?.stateName || "Global";

      logger.info(`Session stateId: ${stateId}, stateName: ${stateName}`);
      logger.info(`Request IP: ${req.ip}`);

      // 3. If not in session, call geolocation API and store in session
      if (!stateId) {
        // Use Express's built-in IP extraction (requires app.set('trust proxy', true))
        let ip = req.ip;
        // Remove IPv6 prefix if present
        if (ip && ip.startsWith("::ffff:")) ip = ip.substring(7);

        logger.info(`Extracted IP for geolocation: ${ip}`);

        try {
          const geo = await getStateFromIp(ip);
          stateId = geo?.stateId || null;
          stateName = geo?.stateName || "Global";
          // Store in session for future requests
          req.session.stateId = stateId;
          req.session.stateName = stateName;
          logger.info(`Geolocation resolved: stateId=${stateId}, stateName=${stateName}`);
        } catch (geoErr) {
          logger.error("Failed to resolve geolocation:", geoErr.message);
        }
      }

      // 4. Determine which model to use based on type
      const typeToModel = {
        home: { model: models.HomeFaq, name: "HomeFaq" },
        goldloan: { model: models.GoldLoanFaq, name: "GoldloanFaq" },
        contact: { model: models.ContactFaq, name: "ContactFaq" },
        msme: { model: models.MsmeLoanFaq, name: "MsmeLoanFaq" },
      };

      const selected = typeToModel[type];
      if (!selected) {
        return next(new CustomError("Invalid FAQ type. Use 'home', 'goldloan', 'contact', or 'msme'", 400));
      }

      const { model: faqModel, name: modelName } = selected;
      const cacheKey = `web${modelName}_${stateId || "null"}`;

      // 5. Check cache
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info(`Cache hit for ${cacheKey}`);
        return res.json({ status: "success", faqs: JSON.parse(cachedData) });
      }

      // 6. Fetch FAQs based on location and type
      const faqs = await faqModel.findAll({
        where: {
          is_active: true,
          [Op.or]: [{ state_id: stateId || null }, { state_id: null }],
        },
        order: [["order", "ASC"]],
      });

      // 7. Cache the result
      await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);

      res.json({ status: "success", faqs });
    } catch (error) {
      logger.error("Error in getFaqData:", error);
      next(new CustomError("Failed to fetch FAQ data", 500, error.message));
    }
  }
}

module.exports = FaqController;

// const { models, sequelize } = require("../models/index");
// const CacheService = require("../services/cacheService");
// const CustomError = require("../utils/customError");
// const logger = require("../services/logger");
// const { Sequelize, where, Op } = require("sequelize");
// const { getStateFromIp } = require("../utils/geolocation");

// class FaqController {
//   static async getFaqData(req, res, next) {
//     // Get type from query parameters or body
//     const type = req.query.type || req.body.type || "home";

//     // 1. Try to get stateId and stateName from session
//     let stateId = req.session?.stateId || null;
//     let stateName = req.session?.stateName || "Global";

//     console.log(" ===>", stateId, stateName);
//     console.log("ip ===>", req.ip);

//     // 2. If not in session, call geolocation API and store in session
//     if (!stateId) {
//       const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
//       try {
//         const geo = await getStateFromIp(ip);
//         stateId = geo.stateId;
//         stateName = geo.stateName;
//         // Store in session for future requests
//         req.session.stateId = stateId;
//         req.session.stateName = stateName;
//       } catch (error) {
//         console.error("Failed to resolve geolocation:", error.message);
//       }
//     }

//     // Determine which model to use based on type
//     let faqModel;
//     let modelName;

//     switch (type.toLowerCase()) {
//       case "home":
//         faqModel = models.HomeFaq;
//         modelName = "HomeFaq";
//         break;
//       case "goldloan":
//         faqModel = models.GoldLoanFaq;
//         modelName = "GoldloanFaq";
//         break;
//       case "contact":
//         faqModel = models.ContactFaq;
//         modelName = "ContactFaq";
//         break;
//       case "msme":
//         faqModel = models.MsmeLoanFaq;
//         modelName = "MsmeLoanFaq";
//         break;
//       default:
//         return next(new CustomError("Invalid FAQ type. Use 'home', 'goldloan', or 'contact'", 400));
//     }

//     const cacheKey = `web${modelName}_${stateId || "null"}`;
//     try {
//       const cachedData = await CacheService.get(cacheKey);
//       // if (cachedData) {
//       //   return res.json({ status: "success", data: JSON.parse(cachedData) });
//       // }

//       // Fetch FAQs based on location and type
//       const faqs = await faqModel
//         .findAll({
//           where: {
//             is_active: true,
//             [Op.or]: [{ state_id: stateId || null }, { state_id: null }],
//           },
//           order: [["order", "ASC"]],
//         })
//         .catch((err) => {
//           console.error(`Failed to fetch ${modelName}:`, err.message);
//           throw err;
//         });

//       await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);

//       res.json({ status: "success", faqs });
//     } catch (error) {
//       console.error(`Error fetching ${modelName} data:`, error.message);
//       next(new CustomError(`Failed to fetch ${modelName} data`, 500, error.message));
//     }
//   }
// }

// module.exports = FaqController;
