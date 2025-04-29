const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const HomeStatistics = models.HomeStatistics;

class HomeStatisticsController {
  static async create(req, res, next) {
    try {
      const { title, value, suffix, sort_order, status } = req.body;

      const homeStatistics = await HomeStatistics.create({
        title,
        value,
        suffix,
        sort_order,
        status,
      });

      await CacheService.invalidate("homeStatistics");
      await CacheService.invalidate("webHomeData");
      res.status(201).json({ success: true, data: homeStatistics });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "homeStatistics";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const homeStatistics = await HomeStatistics.findAll({
        order: [["sort_order", "ASC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(homeStatistics), 3600);
      res.json({ success: true, data: homeStatistics });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const homeStatistics = await HomeStatistics.findByPk(req.params.id);
      if (!homeStatistics) {
        throw new CustomError("Home Statistics not found", 404);
      }
      res.json({ success: true, data: homeStatistics });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const homeStatistics = await HomeStatistics.findByPk(req.params.id);
      if (!homeStatistics) {
        throw new CustomError("Home Statistics not found", 404);
      }

      const { title, value, suffix, sort_order, status } = req.body;

      await homeStatistics.update({
        title,
        value,
        suffix,
        sort_order,
        status,
      });

      await CacheService.invalidate("homeStatistics");
      await CacheService.invalidate("webHomeData");
      res.json({ success: true, data: homeStatistics });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const homeStatistics = await HomeStatistics.findByPk(req.params.id);
      if (!homeStatistics) {
        throw new CustomError("Home Statistics not found", 404);
      }
      await homeStatistics.destroy();
      await CacheService.invalidate("homeStatistics");
      await CacheService.invalidate("webHomeData");
      res.json({ success: true, message: "Home Statistics deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomeStatisticsController;
