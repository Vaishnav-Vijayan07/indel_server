const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CareerGallery = models.CareerGallery;

class CareerGalleryController {
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
        updateData.image = `/uploads/career-gallery/${req.file.filename}`;
        Logger.info(`Uploaded image for CareerGallery: ${updateData.image}`);
      }

      const gallery = await CareerGallery.create(updateData);

      await CacheService.invalidate("careerGallery");
       await CacheService.invalidate("webCareerPage");
      res.status(201).json({ success: true, data: gallery, message: "Career Gallery item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "careerGallery";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const galleries = await CareerGallery.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(galleries), 3600);
      res.json({ success: true, data: galleries });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `careerGallery_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const gallery = await CareerGallery.findByPk(id);
      if (!gallery) {
        throw new CustomError("Career Gallery item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(gallery), 3600);
      res.json({ success: true, data: gallery });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const gallery = await CareerGallery.findByPk(id);
      if (!gallery) {
        throw new CustomError("Career Gallery item not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = gallery.image;

      if (req.file) {
        updateData.image = `/uploads/career-gallery/${req.file.filename}`;
        Logger.info(`Updated image for CareerGallery ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await CareerGalleryController.deleteFile(oldImage);
        }
      }

      await gallery.update(updateData);

      await CacheService.invalidate("careerGallery");
       await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerGallery_${id}`);
      res.json({ success: true, data: gallery, message: "Career Gallery item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const gallery = await CareerGallery.findByPk(id);
      if (!gallery) {
        throw new CustomError("Career Gallery item not found", 404);
      }

      const oldImage = gallery.image;
      await gallery.destroy();

      if (oldImage) {
        await CareerGalleryController.deleteFile(oldImage);
      }

      await CacheService.invalidate("careerGallery");
       await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerGallery_${id}`);
      res.json({ success: true, message: "Career Gallery item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CareerGalleryController;
