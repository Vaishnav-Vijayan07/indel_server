const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Service = models.Services;

class ServicesController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/services/${req.file.filename}`;
        Logger.info(`Uploaded image for Service: ${updateData.image}`);
      }

      const service = await Service.create(updateData);

      await CacheService.invalidate("Services");
      await CacheService.invalidate("webOurServices");
      res.status(201).json({ success: true, data: service, message: "Service created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Services";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const services = await Service.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(services), 3600);
        return res.json({ success: true, data: services });
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
      const cacheKey = search ? null : `Services_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Service.findAndCountAll({
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
      const cacheKey = `Service_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const service = await Service.findByPk(id);
      if (!service) {
        throw new CustomError("Service not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(service), 3600);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        throw new CustomError("Service not found", 404);
      }

      const updateData = { ...req.body };
      let oldImageUrl = service.image;

      if (req.file) {
        updateData.image = `/uploads/services/${req.file.filename}`;
        Logger.info(`Updated image for Service ID ${id}: ${updateData.image}`);
        if (oldImageUrl) {
          await ServicesController.deleteFile(oldImageUrl);
        }
      }

      await service.update(updateData);

      await CacheService.invalidate("Services");
      await CacheService.invalidate("webOurServices");
      await CacheService.invalidate(`Service_${id}`);

      res.json({ success: true, data: service, message: "Service updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        throw new CustomError("Service not found", 404);
      }

      const oldImageUrl = service.image;
      await service.destroy();

      if (oldImageUrl) {
        await ServicesController.deleteFile(oldImageUrl);
      }

      await CacheService.invalidate("Services");
      await CacheService.invalidate("webOurServices");
      await CacheService.invalidate(`Service_${id}`);
      res.json({ success: true, message: "Service deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServicesController;