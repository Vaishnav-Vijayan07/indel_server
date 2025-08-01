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
      const cacheKey = "Services";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const services = await Service.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(services), 3600);
      res.json({ success: true, data: services });
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