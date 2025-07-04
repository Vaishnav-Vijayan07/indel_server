const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const fs = require("fs").promises;
const path = require("path");
const Logger = require("../../services/logger");

const HeroBanner = models.HeroBanner;
const States = models.CareerStates;

class HeroBannerController {
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
      const { title, button_text, button_link, image_alt_text, is_active, order, state_id, banner_type } = req.body;
      const image = req.files?.image ? `/uploads/banner/${req.files.image[0].filename}` : null;
      const mobileImage = req.files?.image_mobile ? `/uploads/banner/${req.files.image_mobile[0].filename}` : null;

      if (!image) {
        throw new CustomError("Image is required", 400);
      }

      if (state_id) {
        const state = await States.findByPk(state_id);
        if (!state || !state.is_active) {
          throw new CustomError("Invalid or inactive state", 400);
        }
      }

      const heroBanner = await HeroBanner.create({
        title,
        button_text,
        button_link,
        state_id: state_id || null,
        image,
        image_mobile: mobileImage,
        image_alt_text,
        is_active,
        banner_type,
        order,
      });

      await CacheService.invalidate("heroBanners");
      await CacheService.invalidate(`banners_${state_id || "null"}`);
      await CacheService.invalidate("webHomeData");

      res.status(201).json({ success: true, data: heroBanner, message: "Hero Banner created successfully" });
    } catch (error) {
      next(error);
    }
  }

  // static async getAll(req, res, next) {
  //   try {
  //     const cacheKey = "heroBanners";
  //     const cachedData = await CacheService.get(cacheKey);

  //     // if (cachedData) {
  //     //   return res.json({ success: true, data: JSON.parse(cachedData) });
  //     // }

  //     const heroBanners = await HeroBanner.findAll({
  //       order: [["order", "ASC"]],
  //     });
  //     await CacheService.set(cacheKey, JSON.stringify(heroBanners), 3600);
  //     res.json({ success: true, data: heroBanners });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async getAll(req, res, next) {
    try {
      const { stateId } = req.query;
      const cacheKey = `banners_${stateId || "null"}`;
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      let whereClause = { is_active: true };
      if (stateId) {
        whereClause = {
          ...whereClause,
          [Op.or]: [{ state_id: Number(stateId) }, { state_id: null }],
        };
      }

      const banners = await HeroBanner.findAll({
        where: whereClause,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
        order: [
          [sequelize.literal(`state_id ${stateId ? "= " + Number(stateId) : "IS NULL"}`), "DESC"],
          ["order", "ASC"],
          ["createdAt", "DESC"],
        ],
        // limit: Number(limit),
      });

      await CacheService.set(cacheKey, JSON.stringify(banners), 3600);
      res.json({ success: true, data: banners });
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

      const oldImage = heroBanner.image;
      const oldImageMobile = heroBanner.image_mobile;

      const { title, button_text, button_link, location, image_alt_text, is_active, order, state_id, banner_type } = req.body;
      const image = req.files?.image ? `/uploads/banner/${req.files.image[0].filename}` : heroBanner.image;
      const mobileImage = req.files?.image_mobile ? `/uploads/banner/${req.files.image_mobile[0].filename}` : heroBanner.image_mobile;

      if (state_id) {
        const state = await States.findByPk(state_id);
        if (!state || !state.is_active) {
          throw new CustomError("Invalid or inactive state", 400);
        }
      }

      console.log(oldImage)
      console.log(oldImageMobile)

      await heroBanner.update({
        title,
        button_text,
        button_link,
        location,
        image,
        image_mobile: mobileImage,
        state_id: state_id || null,
        image_alt_text,
        is_active,
        banner_type,
        order,
      });

      await CacheService.invalidate("heroBanners");
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, data: heroBanner, message: "Hero Banner updated successfully" });
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

      res.json({ success: true, message: "Hero banner deleted", data: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HeroBannerController;
