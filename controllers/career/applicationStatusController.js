const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

class ApplicationStatusesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const applicationStatus = await models.ApplicationStatus.create(updateData);

      // Invalidate cache
      await CacheService.invalidate("application_statuses");
      res.status(201).json({ success: true, data: applicationStatus, message: "Application status created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "application_statuses";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const statuses = await models.ApplicationStatus.findAll({
        // where: { is_active: true },
        order: [
          ["order", "ASC"],
          ["created_at", "DESC"],
        ],
      });

      await CacheService.set(cacheKey, JSON.stringify(statuses), 3600);
      res.json({ success: true, data: statuses });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `application_status_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const status = await models.ApplicationStatus.findByPk(id);
      if (!status) {
        throw new CustomError("Application status not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(status), 3600);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const status = await models.ApplicationStatus.findByPk(id);
      if (!status) {
        throw new CustomError("Application status not found", 404);
      }

      const updateData = { ...req.body };

      await status.update(updateData);

      // Invalidate caches
      await Promise.all([CacheService.invalidate("application_statuses"), CacheService.invalidate(`application_status_${id}`)]);
      res.json({ success: true, data: status, message: "Application status updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const status = await models.ApplicationStatus.findByPk(id);
      if (!status) {
        throw new CustomError("Application status not found", 404);
      }

      await status.destroy();

      // Invalidate caches
      await Promise.all([CacheService.invalidate("application_statuses"), CacheService.invalidate(`application_status_${id}`)]);
      res.json({ success: true, message: "Application status deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ApplicationStatusesController;
