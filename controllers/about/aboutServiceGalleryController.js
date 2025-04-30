const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutServiceGallery = models.AboutServiceGallery;

class AboutServiceGalleryController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..","..", "uploads", filePath.replace("/uploads/", ""));
      console.log(`Deleting file: ${absolutePath}`);
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
      const data = { ...req.body };
      if (req.file) {
        data.image = `/uploads/about-service-gallery/${req.file.filename}`;
        Logger.info(`Uploaded image for AboutServiceGallery: ${data.image}`);
      }

      const galleryItem = await AboutServiceGallery.create(data);

      await CacheService.invalidate("aboutServiceGallery");
      res.status(201).json({ success: true, data: galleryItem, message: "Gallery item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "aboutServiceGallery";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const items = await AboutServiceGallery.findAll({ order: [["order", "ASC"]] });

      await CacheService.set(cacheKey, JSON.stringify(items), 3600);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `aboutServiceGallery_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const item = await AboutServiceGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(item), 3600);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await AboutServiceGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
      }

      const data = { ...req.body };
      const oldImage = item.image;

      if (req.file) {
        data.image = `/uploads/about-life-at-indel-gallery/${req.file.filename}`;
        Logger.info(`Updated image for AboutServiceGallery ID ${id}: ${data.image}`);
        if (oldImage) {
          await AboutServiceGalleryController.deleteFile(oldImage);
        }
      }

      await item.update(data);

      await CacheService.invalidate("aboutServiceGallery");
      await CacheService.invalidate(`aboutServiceGallery_${id}`);
      res.json({ success: true, data: item, message: "Gallery item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const item = await AboutServiceGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
      }

      const oldImage = item.image;
      await item.destroy();

      if (oldImage) {
        await AboutServiceGalleryController.deleteFile(oldImage);
      }

      await CacheService.invalidate("aboutServiceGallery");
      await CacheService.invalidate(`aboutServiceGallery_${id}`);
      res.json({ success: true, message: "Gallery item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutServiceGalleryController;
