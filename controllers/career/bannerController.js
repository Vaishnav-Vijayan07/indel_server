const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CareerBanners = models.CareerBanners;

class CareerBannersController {
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
        updateData.image = `/uploads/career-banners/${req.file.filename}`;
        Logger.info(`Uploaded image for CareerBanner: ${updateData.image}`);
      }

      const banner = await CareerBanners.create(updateData);

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      res.status(201).json({ success: true, data: banner, message: "Career Banner created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "careerBanners";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banners = await CareerBanners.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(banners), 3600);
      res.json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `careerBanner_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(banner), 3600);
      res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = banner.image;

      if (req.file) {
        updateData.image = `/uploads/career-banners/${req.file.filename}`;
        Logger.info(`Updated image for CareerBanner ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await CareerBannersController.deleteFile(oldImage);
        }
      }

      await banner.update(updateData);

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerBanner_${id}`);
      res.json({ success: true, data: banner, message: "Career Banner updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      const oldImage = banner.image;
      await banner.destroy();

      if (oldImage) {
        await CareerBannersController.deleteFile(oldImage);
      }

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerBanner_${id}`);
      res.json({ success: true, message: "Career Banner deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CareerBannersController;
