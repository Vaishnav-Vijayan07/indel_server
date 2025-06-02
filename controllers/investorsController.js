const { models } = require("../models");
const cacheService = require("../services/cacheService");
const logger = require("../services/logger");

class InvestorsController {
    static async csrReports(req, res, next) {
        const cacheKey = "webCsrReports";

        try {
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) {
                logger.info("Serving csr report from cache");
                return res.json({ status: "success", data: JSON.parse(cachedData) });
            }

            const [content, annualReports, annualReturn] =
                await Promise.all([
                    models.InvestorsPageContent.findAll({
                        attributes: ["annual_returns_title", "annual_report_button_title"],
                    }),
                    models.AnnualReport.findAll({
                        attributes: ["id", "year", "file", "order"],
                        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
                        order: [["order", "ASC"]],
                    }),
                    models.AnnualReturns.findAll({
                        attributes: ["id", "year", "file", "order"],
                        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
                        order: [["order", "ASC"]],
                    }),
                ]);

            const data = {
                content: content[0] || null,
                annualReports,
                annualReturn,
            };

            await cacheService.set(cacheKey, JSON.stringify(data), 3600);
            logger.info("Fetched csr report from DB");
            res.json({ status: "success", data });
        } catch (error) {
            logger.error("Error fetching csr report", { error: error.message, stack: error.stack });
            next(new CustomError("Failed to fetch csr report", 500, error.message));
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

            const [content, contact] =
                await Promise.all([
                    models.InvestorsPageContent.findAll({
                        attributes: ["investors_contact_title"],
                    }),
                    models.InvestorsContact.findAll({
                        order: [["order", "ASC"]],
                    }
                    ),
                ]);

            const data = {
                content: content[0] || null,
                contact
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
                    message: "Invalid pagination parameters"
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
                    attributes: ["policies_title"],
                }),
                // Policies with pagination
                models.Policies.findAndCountAll({
                    order: [["order", "ASC"]],
                    limit: limit,
                    offset: offset,
                })
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
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    offset: offset
                }
            };

            // Cache for shorter time for paginated results
            await cacheService.set(cacheKey, JSON.stringify(data), 1800); // 30 minutes instead of 1 hour

            logger.info(`Fetched investors policies from DB - Page: ${page}, Limit: ${limit}, Total: ${policiesResult.count}`);
            res.json({ status: "success", data });

        } catch (error) {
            logger.error("Error fetching investors policies", {
                error: error.message,
                stack: error.stack,
                query: req.query
            });
            next(new CustomError("Failed to fetch investors policies", 500, error.message));
        }
    }
}

module.exports = InvestorsController;