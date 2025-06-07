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
      const cacheKey = "GoldCaratTypes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const goldCaratTypes = await GoldCaratTypes.findAll({
        order: [["name", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(goldCaratTypes), 3600);
      res.json({ success: true, data: goldCaratTypes });
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