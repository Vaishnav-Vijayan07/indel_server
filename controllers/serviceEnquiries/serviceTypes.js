const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const ServiceTypes = models.ServiceTypes;

class ServiceTypesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const serviceType = await ServiceTypes.create(data);
      await CacheService.invalidate("ServiceTypes");

      Logger.info("New Service Type created");
      res.status(201).json({ success: true, data: serviceType, message: "Service Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ServiceTypes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const serviceTypes = await ServiceTypes.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(serviceTypes), 3600);
      res.json({ success: true, data: serviceTypes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `ServiceType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const serviceType = await ServiceTypes.findByPk(id);
      if (!serviceType) {
        throw new CustomError("Service Type not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(serviceType), 3600);
      res.json({ success: true, data: serviceType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const serviceType = await ServiceTypes.findByPk(id);

      if (!serviceType) {
        throw new CustomError("Service Type not found", 404);
      }

      await serviceType.update(req.body);
      await CacheService.invalidate("ServiceTypes");
      await CacheService.invalidate(`ServiceType_${id}`);

      Logger.info(`Service Type ID ${id} updated`);
      res.json({ success: true, data: serviceType, message: "Service Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const serviceType = await ServiceTypes.findByPk(id);

      if (!serviceType) {
        throw new CustomError("Service Type not found", 404);
      }

      await serviceType.destroy();
      await CacheService.invalidate("ServiceTypes");
      await CacheService.invalidate(`ServiceType_${id}`);

      Logger.info(`Service Type ID ${id} deleted`);
      res.json({ success: true, message: "Service Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceTypesController;