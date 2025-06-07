const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldTypes = models.GoldTypes;

class GoldTypesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const goldType = await GoldTypes.create(data);
      await CacheService.invalidate("GoldTypes");

      Logger.info("New Gold Type created");
      res.status(201).json({ success: true, data: goldType, message: "Gold Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "GoldTypes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const goldTypes = await GoldTypes.findAll({
        order: [["gold_type_name", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(goldTypes), 3600);
      res.json({ success: true, data: goldTypes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `GoldType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const goldType = await GoldTypes.findByPk(id);
      if (!goldType) {
        throw new CustomError("Gold Type not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(goldType), 3600);
      res.json({ success: true, data: goldType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const goldType = await GoldTypes.findByPk(id);

      if (!goldType) {
        throw new CustomError("Gold Type not found", 404);
      }

      await goldType.update(req.body);
      await CacheService.invalidate("GoldTypes");
      await CacheService.invalidate(`GoldType_${id}`);

      Logger.info(`Gold Type ID ${id} updated`);
      res.json({ success: true, data: goldType, message: "Gold Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const goldType = await GoldTypes.findByPk(id);

      if (!goldType) {
        throw new CustomError("Gold Type not found", 404);
      }

      await goldType.destroy();
      await CacheService.invalidate("GoldTypes");
      await CacheService.invalidate(`GoldType_${id}`);

      Logger.info(`Gold Type ID ${id} deleted`);
      res.json({ success: true, message: "Gold Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldTypesController;
