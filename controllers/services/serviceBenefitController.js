const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const ServiceBenefit = models.ServiceBenefit;

class ServiceBenefitsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted icon file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete icon file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      const { service_id } = req.body;
      const service = await models.Services.findByPk(service_id);
      if (!service) {
        throw new CustomError("Service not found", 404);
      }
      if (!service.is_active) {
        throw new CustomError("Service is not active", 404);
      }
      if (req.file) {
        updateData.icon = `/uploads/service-benefits/${req.file.filename}`;
        Logger.info(`Uploaded icon for Benefit: ${updateData.icon}`);
      }

      const benefit = await ServiceBenefit.create(updateData);
      await CacheService.invalidate("ServiceBenefits_all");
      await CacheService.invalidatePattern("ServiceBenefit_*");
      await CacheService.invalidatePattern("serviceBenefits_page_*");
      await CacheService.invalidatePattern("ServiceBenefits_bySlug_*");

      res.status(201).json({ success: true, data: benefit, message: "Service benefit created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "ServiceBenefits_all";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const benefits = await ServiceBenefit.findAll({
          order: [["order", "ASC"]],
          include: [
            {
              model: models.Services,
              attributes: ["title"],
              as: "service",
            },
          ],
        });

        await CacheService.set(cacheKey, JSON.stringify(benefits), 3600);
        return res.json({ success: true, data: benefits });
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
      const cacheKey = search ? null : `serviceBenefits_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await ServiceBenefit.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.Services,
            attributes: ["title"],
            as: "service",
          },
        ],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
        distinct: true,
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
      const cacheKey = `ServiceBenefit_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const benefit = await ServiceBenefit.findByPk(id);
      if (!benefit) {
        throw new CustomError("Service benefit not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(benefit), 3600);
      res.json({ success: true, data: benefit });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const benefit = await ServiceBenefit.findByPk(id);
      if (!benefit) {
        throw new CustomError("Service benefit not found", 404);
      }

      const updateData = { ...req.body };
      const oldIconUrl = benefit.icon;

      if (req.file) {
        updateData.icon = `/uploads/service-benefits/${req.file.filename}`;
        Logger.info(`Updated icon for Benefit ID ${id}: ${updateData.icon}`);
        if (oldIconUrl) {
          await ServiceBenefitsController.deleteFile(oldIconUrl);
        }
      }

      await benefit.update(updateData);

      await CacheService.invalidate("ServiceBenefits_all");
      await CacheService.invalidatePattern("ServiceBenefit_*");
      await CacheService.invalidatePattern("serviceBenefits_page_*");
      await CacheService.invalidatePattern("ServiceBenefits_bySlug_*");

      res.json({ success: true, data: benefit, message: "Service benefit updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const benefit = await ServiceBenefit.findByPk(id);
      if (!benefit) {
        throw new CustomError("Service benefit not found", 404);
      }

      const iconUrl = benefit.icon;

      await benefit.destroy();
      if (iconUrl) {
        await ServiceBenefitsController.deleteFile(iconUrl);
      }

      await CacheService.invalidate("ServiceBenefits_all");
      await CacheService.invalidatePattern("ServiceBenefit_*");
      await CacheService.invalidatePattern("serviceBenefits_page_*");
      await CacheService.invalidatePattern("ServiceBenefits_bySlug_*");

      res.json({ success: true, message: "Service benefit deleted", data: id });
    } catch (error) {
      next(error);
    }
  }

  static async getByServiceSlug(req, res, next) {
    try {
      const { slug } = req.params;
      const { page, limit, search } = req.query;

      const service = await models.Services.findOne({
        where: { slug, is_active: true },
        attributes: ["id", "title", "slug"],
      });

      if (!service) {
        throw new CustomError("Service not found", 404);
      }

      // If no pagination params, return full list (backward compatible)
      if (!page && !limit) {
        const cacheKey = `ServiceBenefits_bySlug_${slug}`;
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const benefits = await ServiceBenefit.findAll({
          where: {
            service_id: service.id,
            // is_active: true,
          },
          attributes: ["id", "icon", "image_alt", "title", "order", "is_active"],
          order: [["order", "ASC"]],
        });

        const responseData = {
          service: {
            id: service.id,
            title: service.title,
            slug: service.slug,
          },
          benefits,
        };

        await CacheService.set(cacheKey, JSON.stringify(responseData), 3600);

        Logger.info(`Fetched and cached service benefits for slug: ${slug}`);

        return res.json({ success: true, data: responseData });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = { service_id: service.id };
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `ServiceBenefits_bySlug_${slug}_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await ServiceBenefit.findAndCountAll({
        where: whereConditions,
        attributes: ["id", "icon", "image_alt", "title", "order", "is_active"],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      const response = {
        success: true,
        service: {
          id: service.id,
          title: service.title,
          slug: service.slug,
        },
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

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      Logger.info(`Fetched service benefits for slug: ${slug}, page ${pageNum}`);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async createByServiceSlug(req, res, next) {
    try {
      const { slug } = req.params;
      const updateData = { ...req.body };

      const service = await models.Services.findOne({
        where: { slug, is_active: true },
        attributes: ["id", "slug"],
      });
      if (!service) {
        throw new CustomError("Service not found", 404);
      }

      updateData.service_id = service.id; // Set service_id from found service

      if (req.file) {
        updateData.icon = `/Uploads/service-benefits/${req.file.filename}`;
        Logger.info(`Uploaded icon for Benefit: ${updateData.icon}`);
      }

      const benefit = await ServiceBenefit.create(updateData);
      await CacheService.invalidate("ServiceBenefits_all");
      await CacheService.invalidatePattern("ServiceBenefit_*");
      await CacheService.invalidatePattern("serviceBenefits_page_*");
      await CacheService.invalidatePattern("ServiceBenefits_bySlug_*");

      Logger.info(`Created service benefit for service slug: ${slug}`);

      res.status(201).json({ success: true, data: benefit, message: "Service benefit created successfully" });
    } catch (error) {
      if (req.file) {
        // Cleanup uploaded file on error
        await ServiceBenefitsController.deleteFile(`/Uploads/service-benefits/${req.file.filename}`);
      }
      next(error);
    }
  }
}

module.exports = ServiceBenefitsController;
