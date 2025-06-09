const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const PopupServices = models.PopupServices;

class PopupServicesController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "Uploads", filePath.replace("/uploads/", ""));
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
        updateData.image = `/uploads/popup-services/${req.file.filename}`;
        Logger.info(`Uploaded image for PopupService: ${updateData.image}`);
      }

      const popupService = await PopupServices.create(updateData);

      await CacheService.invalidate("popupServices");
      res.status(201).json({ success: true, data: popupService, message: "Popup Service created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "popupServices";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const popupServices = await PopupServices.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(popupServices), 3600);
      res.json({ success: true, data: popupServices });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `popupService_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const popupService = await PopupServices.findByPk(id);
      if (!popupService) {
        throw new CustomError("Popup Service not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(popupService), 3600);
      res.json({ success: true, data: popupService });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const popupService = await PopupServices.findByPk(id);
      if (!popupService) {
        throw new CustomError("Popup Service not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = popupService.image;

      if (req.file) {
        updateData.image = `/uploads/popup-services/${req.file.filename}`;
        Logger.info(`Updated image for PopupService ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await PopupServicesController.deleteFile(oldImage);
        }
      }

      await popupService.update(updateData);

      await CacheService.invalidate("popupServices");
      await CacheService.invalidate(`popupService_${id}`);
      res.json({ success: true, data: popupService, message: "Popup Service updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const popupService = await PopupServices.findByPk(id);
      if (!popupService) {
        throw new CustomError("Popup Service not found", 404);
      }

      const oldImage = popupService.image;
      await popupService.destroy();

      if (oldImage) {
        await PopupServicesController.deleteFile(oldImage);
      }

      await CacheService.invalidate("popupServices");
      await CacheService.invalidate(`popupService_${id}`);
      res.json({ success: true, message: "Popup Service deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PopupServicesController;
