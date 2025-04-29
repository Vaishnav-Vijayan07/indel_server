const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const path = require("path");

const HeroBanner = models.HeroBanner;

class HeroBannerController {
  static async create(req, res, next) {
    try {
      const { title, title2, button_text, button_link, location, image_alt_text } = req.body;
      const image = req.file ? `/uploads/banner/${req.file.filename}` : null;

      if (!image) {
        throw new CustomError("Image is required", 400);
      }

      const heroBanner = await HeroBanner.create({
        title,
        title2,
        button_text,
        button_link,
        location,
        image,
        image_alt_text,
      });

      await CacheService.invalidate("heroBanners");
      await CacheService.invalidate("webHomeData");

      res.status(201).json({ success: true, data: heroBanner });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "heroBanners";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const heroBanners = await HeroBanner.findAll();
      await CacheService.set(cacheKey, JSON.stringify(heroBanners), 3600);
      res.json({ success: true, data: heroBanners });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const heroBanner = await HeroBanner.findByPk(req.params.id);
      if (!heroBanner) {
        throw new CustomError("HeroBanner not found", 404);
      }
      res.json({ success: true, data: heroBanner });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const heroBanner = await HeroBanner.findByPk(req.params.id);
      if (!heroBanner) {
        throw new CustomError("HeroBanner not found", 404);
      }

      const { title, title2, button_text, button_link, location, image_alt_text } = req.body;
      const image = req.file ? `/uploads/banner/${req.file.filename}` : heroBanner.image;

      await heroBanner.update({
        title,
        title2,
        button_text,
        button_link,
        location,
        image,
        image_alt_text,
      });

      await CacheService.invalidate("heroBanners");
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, data: heroBanner });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const heroBanner = await HeroBanner.findByPk(req.params.id);
      if (!heroBanner) {
        throw new CustomError("HeroBanner not found", 404);
      }
      await heroBanner.destroy();
      await CacheService.invalidate("heroBanners");
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, message: "HeroBanner deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HeroBannerController;
