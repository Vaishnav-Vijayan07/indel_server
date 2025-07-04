const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutBanner = models.AboutBanner;

class AboutBannerController {
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

      if (req.files?.image) {
        data.image = `/uploads/about-banners/${req.files.image[0].filename}`;
      }

      if (req.files?.image_mobile) {
        data.image_mobile = `/uploads/about-banners/${req.files.image_mobile[0].filename}`;
      }

      const banner = await AboutBanner.create(data);

      await CacheService.invalidate("aboutBanners");
      res.status(201).json({ success: true, data: banner, message: "About Banner created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "aboutBanners";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banners = await AboutBanner.findAll({ order: [["order", "ASC"]] });

      await CacheService.set(cacheKey, JSON.stringify(banners), 3600);
      res.json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `aboutBanner_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banner = await AboutBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("About Banner not found", 404);
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
      const banner = await AboutBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("About Banner not found", 404);
      }

      const data = { ...req.body };
      const oldImage = banner.image;
      const oldImageMobile = banner.image_mobile;

      if (req.files?.image) {
        data.image = `/uploads/about-banners/${req.files.image[0].filename}`;
        if (oldImage) {
          await AboutBannerController.deleteFile(oldImage);
        }
      }

      if (req.files?.image_mobile) {
        data.image_mobile = `/uploads/about-banners/${req.files.image_mobile[0].filename}`;
        if (oldImageMobile) {
          await AboutBannerController.deleteFile(oldImageMobile);
        }
      }

      await banner.update(data);

      await CacheService.invalidate("aboutBanners");
      await CacheService.invalidate(`aboutBanner_${id}`);
      res.json({ success: true, data: banner, message: "About Banner updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await AboutBanner.findByPk(id);
      if (!banner) {
        throw new CustomError("About Banner not found", 404);
      }

      const oldImage = banner.image;
      await banner.destroy();

      if (oldImage) {
        await AboutBannerController.deleteFile(oldImage);
      }

      await CacheService.invalidate("aboutBanners");
      await CacheService.invalidate(`aboutBanner_${id}`);
      res.json({ success: true, message: "About Banner deleted successfully", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutBannerController;
