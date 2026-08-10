const { Op } = require("sequelize");
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
      await CacheService.invalidatePattern("application_statuses_page_*");
      res.status(201).json({ success: true, data: applicationStatus, message: "Application status created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "application_statuses";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const statuses = await models.ApplicationStatus.findAll({
          order: [
            ["order", "ASC"],
            ["created_at", "DESC"],
          ],
        });

        await CacheService.set(cacheKey, JSON.stringify(statuses), 3600);
        return res.json({ success: true, data: statuses });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.status_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `application_statuses_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await models.ApplicationStatus.findAndCountAll({
        where: whereConditions,
        order: [
          ["order", "ASC"],
          ["created_at", "DESC"],
        ],
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
      await Promise.all([CacheService.invalidate("application_statuses"), CacheService.invalidate(`application_status_${id}`), CacheService.invalidatePattern("application_statuses_page_*")]);
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
      await Promise.all([CacheService.invalidate("application_statuses"), CacheService.invalidate(`application_status_${id}`), CacheService.invalidatePattern("application_statuses_page_*")]);
      res.json({ success: true, message: "Application status deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ApplicationStatusesController;
