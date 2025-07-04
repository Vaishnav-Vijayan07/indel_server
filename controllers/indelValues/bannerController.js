const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MobileBanner = models.ValuesBannerMobile;

class ValuesBannerMobileController {
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
      const data = { ...req.body };
      if (req.file) {
        data.image = `/uploads/value-banners/${req.file.filename}`;
        Logger.info(`Uploaded image for MobileBanner: ${data.image}`);
      }

      const banner = await MobileBanner.create(data);

      await CacheService.invalidate("mobileBanners");
      res.status(201).json({ success: true, data: banner, message: "Mobile Banner created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "mobileBanners";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banners = await MobileBanner.findAll({ order: [["order", "ASC"]] });

      await CacheService.set(cacheKey, JSON.stringify(banners), 3600);
      res.json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `mobileBanner_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banner = await MobileBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("Mobile Banner not found", 404);
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
      const banner = await MobileBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("Mobile Banner not found", 404);
      }

      const data = { ...req.body };
      const oldImage = banner.image;

      if (req.file) {
        data.image = `/uploads/value-banners/${req.file.filename}`;
        Logger.info(`Updated image for MobileBanner ID ${id}: ${data.image}`);
        if (oldImage) {
          await ValuesBannerMobileController.deleteFile(oldImage);
        }
      }

      await banner.update(data);

      await CacheService.invalidate("mobileBanners");
      await CacheService.invalidate(`mobileBanner_${id}`);
      res.json({ success: true, data: banner, message: "Mobile Banner updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await MobileBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("Mobile Banner not found", 404);
      }

      const oldImage = banner.image;
      await banner.destroy();

      if (oldImage) {
        await ValuesBannerMobileController.deleteFile(oldImage);
      }

      await CacheService.invalidate("mobileBanners");
      await CacheService.invalidate(`mobileBanner_${id}`);
      res.json({ success: true, message: "Mobile Banner deleted successfully", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ValuesBannerMobileController;
