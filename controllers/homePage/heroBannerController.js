const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const path = require("path");

const HeroBanner = models.HeroBanner;
const States = models.CareerStates;

class HeroBannerController {
  static async create(req, res, next) {
    try {
      const { title, button_text, button_link, image_alt_text, is_active, order, state_id, banner_type } = req.body;
      const image = req.file ? `/uploads/banner/${req.file.filename}` : null;

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

      const { title, button_text, button_link, location, image_alt_text, is_active, order, state_id, banner_type } = req.body;
      const image = req.file ? `/uploads/banner/${req.file.filename}` : heroBanner.image;

      if (state_id) {
        const state = await States.findByPk(state_id);
        if (!state || !state.is_active) {
          throw new CustomError("Invalid or inactive state", 400);
        }
      }

      await heroBanner.update({
        title,
        button_text,
        button_link,
        location,
        image,
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
