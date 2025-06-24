const { where } = require("sequelize");
const { models } = require("../models");
const cacheService = require("../services/cacheService");
const logger = require("../services/logger");
const CustomError = require("../utils/customError");

class InvestorsController {
  static async AnnualReports(req, res, next) {
    const cacheKey = "webCsrReports";
    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving csr report from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, annualReports, annualReturn] = await Promise.all([
        models.InvestorsPageContent.findAll({
          attributes: ["annual_returns_title", "annual_report_button_title", "page_title"],
        }),
        models.AnnualReport.findAll({
          attributes: ["id", "year", "file", "order", "is_active"],
          where: { is_active: true},
          include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", 'is_active'], where: { is_active: true} }],
          order: [["order", "ASC"]],
        }),
        models.AnnualReturns.findAll({
          attributes: ["id", "year", "file", "order", "is_active"],
          where: { is_active: true},
          include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", "is_active"], where: { is_active: true} }],
          order: [["order", "ASC"]],
        }),
      ]);

      

      const data = {
        content: content[0] || null,
        annualReports,
        annualReturn,
      };
``
      // await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      // logger.info("Fetched csr report from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching csr report", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch csr report", 500, error.message));
    }
  }
  static async CorporateGovernence(req, res, next) {
    const cacheKey = "webCorporateGovernence";

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving corporate governance from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, files] = await Promise.all([
        models.InvestorsPageContent.findAll({
          attributes: ["disclosure_title", "disclosure_file", "page_title", "corporate_governance_title"],
        }),
        models.CorporateGovernance.findAll({
          attributes: ["id", "file", "order", "title"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);

      const data = {
        content: content[0] || null,
        files,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched corporate governance from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching corporate governance", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch corporate governance", 500, error.message));
    }
  }

  static async creditRatings(req, res, next) {
    const cacheKey = "webCreditRatings";

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving credit ratings from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

   const [content, files] = await Promise.all([
     models.InvestorsPageContent.findAll({
                    attributes: [
                       "page_title"
                    ],
                }),
     models.CreditRatings.findAll({
                attributes: ["id", "file", "order", "title"],
                order: [["order", "ASC"]],
                where: {is_active: true},
            })
          ])
      const data = {
        content,
        files,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched credit ratings from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching credit ratings", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch credit ratings", 500, error.message));
    }
  }

  static async csrDetails(req, res, next) {
    const cacheKey = "webCsrDetails";

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving csr details from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

            const [content, actionPlans, committees, reports] = await Promise.all([
                models.InvestorsPageContent.findAll({
                    attributes: [
                      "page_title",
                        "csr_policy_doc",
                        "csr_committee_title",
                        "csr_reports_title",
                        "csr_action_plan_title",
                        "csr_policy_title",
                    ],
                }),
                models.CsrActionPlan.findAll({
                    where: { is_active: true },
                    attributes: ["id", "nature", "name", "designation", "order"],
                    order: [["order", "ASC"]],
                    attributes: ["id", "report", "order", "fiscal_year"],
                    include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", "is_active"], where: { is_active: true} }],
                    order: [["order", "ASC"]],
                }),
                models.CsrCommittee.findAll({
                    where: { is_active: true },
                    attributes: ["id", "nature", "name", "designation", "order"],
                    order: [["order", "ASC"]],
                }),
                models.CsrReport.findAll({
                    where: { is_active: true },
                    attributes: ["id", "report", "order", "fiscal_year"],
                    include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", "is_active"], where: { is_active: true} }],
                    order: [["order", "ASC"]],
                }),
            ])

      const data = {
        content: content[0] || null,
        actionPlans,
        committees,
        reports,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched csr details from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching csr details", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch csr details", 500, error.message));
    }
  }

  static async ncdReports(req, res, next) {
    const cacheKey = "webNcdReports";

    try {
      const cachedData = await cacheService.get(cacheKey);
      // if (cachedData) {
      //     logger.info("Serving ncd report from cache");
      //     return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, reports] = await Promise.all([
        models.InvestorsPageContent.findAll({
          attributes: ["ncd_title", "page_title"],
        }),
        models.NcdReports.findAll({
          attributes: ["id", "file", "order", "title", "order", "is_active"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);

      const data = {
        content: content[0] || null,
        reports,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched ncd report from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching ncd report", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch ncd report", 500, error.message));
    }
  }

  static async quarterlyReports(req, res, next) {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        status: "error",
        message: "Year is required",
      });
    }
    const cacheKey = `quarterlyReports:${year}`;

    try {
      const cachedData = await cacheService.get(cacheKey);
      // if (cachedData) {
      //     logger.info("Serving quarterly reports from cache");
      //     return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

            const [content, reports] = await Promise.all([
              models.InvestorsPageContent.findAll({
                attributes: [
                "page_title",
                
              ],
            }),
           models.QuarterlyReports.findAll({
                where: { year, is_active: true},
                attributes: ["id", "title", "year", "file", "is_active", "order"],
                order: [["order", "ASC"]],
                include: [
                    {
                        model: models.FiscalYears,
                        as: "fiscalYear",
                        attributes: ["id", "fiscal_year"]
                    }
                ]
            })
          ])


      const data = {
        content,
        reports,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched quarterly reports from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching quarterly reports", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch quarterly reports", 500, error.message));
    }
  }

  static async contact(req, res, next) {
    const cacheKey = "webInvestorsContact";

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving investors contact from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [content, contact] = await Promise.all([
        models.InvestorsPageContent.findAll({
          attributes: ["investors_contact_title", "page_title"],
        }),
        models.InvestorsContact.findAll({
          attributes: ["id", "title", "name", "address", "email", "phone", "order", "is_active"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);

      const data = {
        content: content[0] || null,
        contact,
      };

      await cacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched investors contact from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching investors contact", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch investors contact", 500, error.message));
    }
  }

  static async policies(req, res, next) {
    try {
      // Extract pagination parameters from query
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const offset = (page - 1) * limit;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          status: "error",
          message: "Invalid pagination parameters",
        });
      }

      // Create cache key that includes pagination parameters
      const cacheKey = `webInvestorsContact_page_${page}_limit_${limit}`;

      // Check cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
          logger.info(`Serving investors policies from cache - Page: ${page}, Limit: ${limit}`);
          return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

            const [content, policiesResult] = await Promise.all([
                // Content doesn't need pagination, fetch once
                models.InvestorsPageContent.findAll({
                    attributes: ["policies_title", "page_title"],
                }),
                // Policies with pagination
                models.Policies.findAndCountAll({
                    order: [["order", "ASC"]],
                    limit: limit,
                    offset: offset,
                    where: { is_active: true },
                },
            )
            ]);

      const totalPages = Math.ceil(policiesResult.count / limit);

      const data = {
        content: content[0] || null,
        policies: policiesResult.rows, // Changed from 'contact' to 'policies'
        pagination: {
          totalCount: policiesResult.count,
          totalPages: totalPages,
          currentPage: page,
          limit: limit,
        },
      };

      // Cache for shorter time for paginated results
      await cacheService.set(cacheKey, JSON.stringify(data), 1800); // 30 minutes instead of 1 hour

      logger.info(`Fetched investors policies from DB - Page: ${page}, Limit: ${limit}, Total: ${policiesResult.count}`);
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching investors policies", {
        error: error.message,
        stack: error.stack,
        query: req.query,
      });
      next(new CustomError("Failed to fetch investors policies", 500, error.message));
    }
  }

  static async fiscalyears(req, res, next) {
    const cacheKey = "webInvestorsYears";

    try {
      const cachedData = await cacheService.get(cacheKey);
      // if (cachedData) {
      //     logger.info("Serving fiscal years for stock exchange from cache");
      //     return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

            const fiscal_years = await models.FiscalYears.findAll(
                { attributes: ["id", "fiscal_year", "is_active"],
                order: [["fiscal_year", "DESC"]],
                where: { is_active: true }}
                );

      await cacheService.set(cacheKey, JSON.stringify(fiscal_years), 3600);
      logger.info("Fetched fiscal years for stock exchange from DB");

      res.json({ status: "success", fiscal_years });
    } catch (error) {
      logger.error("Error fetching fiscal years for stock exchange", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch fiscal years for stock exchange", 500, error.message));
    }
  }

  static async stockExchangeData(req, res, next) {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        status: "error",
        message: "Year is required",
      });
    }

    const cacheKey = `stockExchangeData:${year}`;

    try {
      // Try to get data from cache
      const cachedData = await cacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving stock exchange data from cache");
      //   return res.json({
      //     status: "success",
      //     data: JSON.parse(cachedData),
      //   });
      // }

      // If not in cache, fetch from DB
      const [content, intimations, meetings] = await Promise.all([
         models.InvestorsPageContent.findAll({
                    attributes: [
                       "page_title",
                       "stock_exchange_title"
                    ],
                }),
        models.OtherIntimations.findAll({
            where: {is_active: true},
          attributes: ["id", "fiscal_year", "record_date_document", "interest_payment_document", "month_date"],
          where: { fiscal_year: year, is_active: true },
          include: [
            {
              model: models.FiscalYears,
              as: "fiscalYear",
              attributes: ["id", "fiscal_year"],
            },
          ],
        }),
        models.BoardMeetings.findAll({
          attributes: ["id", "fiscal_year", "outcome_document", "intimation_document", "meeting_date"],
          where: { fiscal_year: year, is_active: true },
          include: [
            {
              model: models.FiscalYears,
              as: "fiscalYear",
              attributes: ["id", "fiscal_year", "is_active", "is_active", "is_active"], 
              where: { is_active: true} }
          ],
        }),
      ]);

      const data = {content, intimations, meetings };

      // Save data in cache for 1 hour (3600 seconds)
      await cacheService.set(cacheKey, JSON.stringify(data), 3600);

      logger.info("Fetched stock exchange data from DB and cached it");

      return res.json({
        status: "success",
        data,
      });
    } catch (error) {
      logger.error("Error fetching stock exchange data", {
        error: error.message,
        stack: error.stack,
      });

      return next(new CustomError("Failed to fetch stock exchange data", 500, error.message));
    }
  }
}

module.exports = InvestorsController;
