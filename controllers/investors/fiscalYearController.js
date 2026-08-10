const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const FiscalYears = models.FiscalYears;

class FiscalYearsController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const fiscalYear = await FiscalYears.create(data);
      await CacheService.invalidate("FiscalYears");
      res.status(201).json({ success: true, data: fiscalYear, message: "Fiscal Year created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "FiscalYears";
        const cachedData = await CacheService.get(cacheKey);

        // if (cachedData) {
        //   return res.json({ success: true, data: JSON.parse(cachedData) });
        // }

        const fiscalYears = await FiscalYears.findAll({
          order: [["fiscal_year", "DESC"]],
        });
        await CacheService.set(cacheKey, JSON.stringify(fiscalYears), 3600);
        return res.json({ success: true, data: fiscalYears });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.fiscal_year = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `FiscalYears_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await FiscalYears.findAndCountAll({
        where: whereConditions,
        order: [["fiscal_year", "DESC"]],
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

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  static async getActiveAll(req, res, next) {
    try {
      const cacheKey = "FiscalYears";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const fiscalYears = await FiscalYears.findAll({
        where: { is_active: true },
        order: [["fiscal_year", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(fiscalYears), 3600);
      res.json({ success: true, data: fiscalYears });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `fiscalYear_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const fiscalYear = await FiscalYears.findByPk(id);
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(fiscalYear), 3600);
      res.json({ success: true, data: fiscalYear });
    } catch (error) {
      
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const fiscalYear = await FiscalYears.findByPk(id);
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      const updateData = { ...req.body };
      await fiscalYear.update(updateData);
      await CacheService.invalidate("FiscalYears");
      await CacheService.invalidate(`fiscalYear_${id}`);
      res.json({ success: true, data: fiscalYear, message: "Fiscal Year updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const fiscalYear = await FiscalYears.findByPk(id);

      
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      await fiscalYear.destroy();
      await CacheService.invalidate("FiscalYears");
      await CacheService.invalidate(`fiscalYear_${id}`);
      res.json({ success: true, message: "Fiscal Year deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FiscalYearsController;
