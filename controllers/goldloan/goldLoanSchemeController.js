const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldLoanScheme = models.GoldLoanScheme;

class GoldLoanSchemeController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const scheme = await GoldLoanScheme.create(updateData);

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemes_page_*");

      res.status(201).json({ success: true, data: scheme, message: "Gold Loan Scheme created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "goldLoanSchemes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const schemes = await GoldLoanScheme.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(schemes), 3600);
        return res.json({ success: true, data: schemes });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `goldLoanSchemes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
         if (cachedData) {
           return res.json(JSON.parse(cachedData));
         }
      }

      const { count, rows } = await GoldLoanScheme.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanScheme_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(scheme), 3600);
      res.json({ success: true, data: scheme });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      const updateData = { ...req.body };

      await scheme.update(updateData);

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate(`goldLoanScheme_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemes_page_*");

      res.json({ success: true, data: scheme, message: "Gold Loan Scheme updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      await scheme.destroy();

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate(`goldLoanScheme_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemes_page_*");
      res.json({ success: true, message: "Gold Loan Scheme deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanSchemeController;
