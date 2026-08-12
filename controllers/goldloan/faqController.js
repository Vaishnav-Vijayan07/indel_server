const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const logger = require("../../services/logger");
const { Op } = require("sequelize");

const GoldLoanFaqs = models.GoldLoanFaq;
const States = models.CareerStates;

class GoldLoanFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await GoldLoanFaqs.create(updateData);

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanFaqs_page_*");

      res.status(201).json({ success: true, data: faq, message: "Gold Loan FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { page, limit, search, stateId } = req.query;
    try {
      // Legacy path - no pagination params
      if (!page && !limit) {
        const cacheKey = "goldLoanFaqs";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          logger.info("Retrieved gold loan data from cache");
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        let whereClause = { is_active: true };
        if (stateId) {
          whereClause = {
            ...whereClause,
            state_id: Number(stateId),
          };
        }

        const faqs = await GoldLoanFaqs.findAll({
          where: whereClause,
          include: [{ model: States, attributes: ["state_name"], as: "state" }],
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);

        logger.info("Retrieved gold loan data");
        return res.json({ success: true, data: faqs });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Merge is_active + stateId + search in whereConditions
      const whereConditions = {
        is_active: true,
        ...(stateId && { state_id: Number(stateId) }),
      };

      // Add search on top
      if (search && search.trim()) {
        whereConditions.question = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `goldLoanFaqs_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) return res.json(JSON.parse(cachedData));
      }

      const { count, rows } = await GoldLoanFaqs.findAndCountAll({
        where: whereConditions,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) await CacheService.set(cacheKey, JSON.stringify(response), 3600);

      logger.info("Retrieved gold loan data");
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(faq), 3600);
      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate(`goldLoanFaq_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanFaqs_page_*");
      res.json({ success: true, data: faq, message: "Gold Loan FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate(`goldLoanFaq_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanFaqs_page_*");
      res.json({ success: true, message: "Gold Loan FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanFaqsController;
