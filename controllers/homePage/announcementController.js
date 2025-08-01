const { models } = require("../../models");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const { Op } = require("sequelize");

const Announcement = models.Announcement;
const CareerStates = models.CareerStates;

class AnnouncementController {
  // Create new announcement
  static async create(req, res, next) {
    try {
      const { text, state_id, is_active } = req.body;

      

      // Validate region if provided
      if (state_id) {
        const state = await CareerStates.findByPk(state_id);
        if (!state || !state.is_active) {
          throw new CustomError("Invalid or inactive state", 400);
        }

        // Check if announcement already exists for this state
        const existing = await Announcement.findOne({
          where: { state_id },
        });
        

        if (existing) {
          throw new CustomError("Only one announcement allowed per state", 409);
        }
      }

      const announcement = await Announcement.create({
        text,
        state_id: state_id || null,
        is_active: is_active ?? true,
      });

      // Invalidate relevant caches
      //   await this.invalidateCaches(state_id);
      res.status(201).json({
        success: true,
        data: announcement,
        message: "Announcement created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all active announcements
  static async getAll(req, res, next) {
    try {
      const { state_id } = req.query;
      //   const cacheKey = `announcements_${state_id || "global"}`;

      //   // Check cache
      //   const cachedData = await CacheService.get(cacheKey);
      //   if (cachedData) {
      //     return res.json({ success: true, data: JSON.parse(cachedData) });
      //   }

      if (state_id) where.state_id = state_id;

      const announcements = await Announcement.findAll({
        include: [
          {
            model: CareerStates,
            as: "state",
            attributes: ["state_name"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // Cache results
      //   await CacheService.set(cacheKey, JSON.stringify(announcements), 3600);
      res.json({ success: true, data: announcements });
    } catch (error) {
      next(error);
    }
  }

  // Update announcement
  static async update(req, res, next) {
    try {
      const announcement = await Announcement.findByPk(req.params.id);
      if (!announcement) {
        throw new CustomError("Announcement not found", 404);
      }

      const { text, state_id, is_active } = req.body;
      const originalStateId = announcement.state_id;

      // Validate new region if changed
      if (state_id && state_id !== announcement.state_id) {
        const state = await CareerStates.findByPk(state_id);
        if (!state || !state.is_active) {
          throw new CustomError("Invalid or inactive state", 400);
        }

        // Check if new state already has an announcement
        const existing = await Announcement.findOne({
          where: { state_id, id: { [Op.ne]: announcement.id } },
        });

        if (existing) {
          throw new CustomError("Only one announcement allowed per state", 409);
        }
      }

      await announcement.update({
        text: text ?? announcement.text,
        state_id: state_id ?? announcement.state_id,
        is_active: is_active ?? announcement.is_active,
      });

      res.json({
        success: true,
        data: announcement,
        message: "Announcement updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete announcement
  static async delete(req, res, next) {
    try {
      const announcement = await Announcement.findByPk(req.params.id);
      if (!announcement) {
        throw new CustomError("Announcement not found", 404);
      }

      const stateId = announcement.state_id;
      await announcement.destroy();

      // Invalidate caches
      await this.invalidateCaches(stateId);
      res.json({
        success: true,
        message: "Announcement deleted",
        data: req.params.id,
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper to invalidate relevant caches
  static async invalidateCaches(stateId) {
    await CacheService.invalidate(`announcements_${stateId || "global"}`);
    await CacheService.invalidate("all_announcements");

    // Also invalidate home page cache if announcements appear there
    await CacheService.invalidate("webHomeData");
  }
}

module.exports = AnnouncementController;
