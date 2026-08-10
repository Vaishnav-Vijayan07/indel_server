const { Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldCaratTypes = models.GoldCaratTypes;

class GoldCaratTypesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const goldCaratType = await GoldCaratTypes.create(data);
      await CacheService.invalidate("GoldCaratTypes");

      Logger.info("New Gold Carat Type created");
      res.status(201).json({ success: true, data: goldCaratType, message: "Gold Carat Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "GoldCaratTypes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const goldCaratTypes = await GoldCaratTypes.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(goldCaratTypes), 3600);
        return res.json({ success: true, data: goldCaratTypes });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `GoldCaratTypes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await GoldCaratTypes.findAndCountAll({
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
      const cacheKey = `GoldCaratType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const goldCaratType = await GoldCaratTypes.findByPk(id);
      if (!goldCaratType) {
        throw new CustomError("Gold Carat Type not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(goldCaratType), 3600);
      res.json({ success: true, data: goldCaratType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const goldCaratType = await GoldCaratTypes.findByPk(id);

      if (!goldCaratType) {
        throw new CustomError("Gold Carat Type not found", 404);
      }

      await goldCaratType.update(req.body);
      await CacheService.invalidate("GoldCaratTypes");
      await CacheService.invalidate(`GoldCaratType_${id}`);

      Logger.info(`Gold Carat Type ID ${id} updated`);
      res.json({ success: true, data: goldCaratType, message: "Gold Carat Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const goldCaratType = await GoldCaratTypes.findByPk(id);

      if (!goldCaratType) {
        throw new CustomError("Gold Carat Type not found", 404);
      }

      await goldCaratType.destroy();
      await CacheService.invalidate("GoldCaratTypes");
      await CacheService.invalidate(`GoldCaratType_${id}`);

      Logger.info(`Gold Carat Type ID ${id} deleted`);
      res.json({ success: true, message: "Gold Carat Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldCaratTypesController;