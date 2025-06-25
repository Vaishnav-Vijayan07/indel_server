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
      await CacheService.invalidate(`ServiceBenefits_${benefit.service_id}`);
      await CacheService.invalidate("ServiceBenefits_all");

      res.status(201).json({ success: true, data: benefit, message: "Service benefit created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ServiceBenefits_all";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        console.log("From cache - Service Benefits");
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
      res.json({ success: true, data: benefits });
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

      res.json({ success: true, message: "Service benefit deleted", data: id });
    } catch (error) {
      next(error);
    }
  }

  static async getByServiceSlug(req, res, next) {
    try {
      const { slug } = req.params;

      const service = await models.Services.findOne({
        where: { slug, is_active: true },
        attributes: ["id", "title", "slug"],
      });

      if (!service) {
        throw new CustomError("Service not found", 404);
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

      Logger.info(`Fetched and cached service benefits for slug: ${slug}`);

      res.json({ success: true, data: responseData });
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
      await CacheService.invalidate(`ServiceBenefits_${service.id}`);
      await CacheService.invalidate(`ServiceBenefits_Slug_${slug}`);
      await CacheService.invalidate("ServiceBenefits_all");

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
