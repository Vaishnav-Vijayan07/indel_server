const { Op } = require("sequelize");
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
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "ServiceTypes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const serviceTypes = await ServiceTypes.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(serviceTypes), 3600);
        return res.json({ success: true, data: serviceTypes });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.type_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `ServiceTypes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await ServiceTypes.findAndCountAll({
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