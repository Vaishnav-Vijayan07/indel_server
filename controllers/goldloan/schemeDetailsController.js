const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldLoanSchemeDetails = models.SchemeDetails;

class GoldLoanSchemeDetailsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { scheme_id } = req.body;
      const scheme = await models.GoldLoanScheme.findByPk(scheme_id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      const schemeDetail = await GoldLoanSchemeDetails.create(updateData);

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemeDetails_page_*");

      res.status(201).json({ success: true, data: schemeDetail, message: "Gold Loan Scheme Detail created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "goldLoanSchemeDetails";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const schemeDetails = await GoldLoanSchemeDetails.findAll({
          order: [["order", "ASC"]],
          include: [{ model: models.GoldLoanScheme, as: "goldLoanScheme" }],
        });
        await CacheService.set(cacheKey, JSON.stringify(schemeDetails), 3600);
        return res.json({ success: true, data: schemeDetails });
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
      const cacheKey = search ? null : `goldLoanSchemeDetails_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {            return res.json(JSON.parse(cachedData));          }
      }

      const { count, rows } = await GoldLoanSchemeDetails.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        include: [{ model: models.GoldLoanScheme, as: "goldLoanScheme" }],
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
      const cacheKey = `goldLoanSchemeDetail_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id, {
        include: [{ model: models.GoldLoanScheme, as: "goldLoanScheme" }],
      });
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(schemeDetail), 3600);
      res.json({ success: true, data: schemeDetail });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id);
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      const updateData = { ...req.body };

      await schemeDetail.update(updateData);

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate(`goldLoanSchemeDetail_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemeDetails_page_*");

      res.json({ success: true, data: schemeDetail, message: "Gold Loan Scheme Detail updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id);
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      await schemeDetail.destroy();

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate(`goldLoanSchemeDetail_${id}`);
      await CacheService.invalidate("webGoldLoan");
      await CacheService.invalidatePattern("goldLoanSchemeDetails_page_*");

      res.json({ success: true, message: "Gold Loan Scheme Detail deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanSchemeDetailsController;
