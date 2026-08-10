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
      const { text, is_active } = req.body;
      // Normalize state_id: empty string or falsy → null, truthy → number
      const state_id = req.body.state_id && req.body.state_id !== "" ? Number(req.body.state_id) : null;

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
        state_id,
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
      const { page, limit, search, state_id } = req.query;

      // Legacy path: unchanged response shape/behavior for backward compatibility
      if (!page && !limit) {
        const cacheKey = `announcements_${state_id || "global"}`;
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const whereConditions = {};
        if (state_id) {
          whereConditions.state_id = state_id;
        }

        const announcements = await Announcement.findAll({
          where: whereConditions,
          include: [
            {
              model: CareerStates,
              as: "state",
              attributes: ["state_name"],
            },
          ],
          order: [["createdAt", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(announcements), 3600);
        return res.json({ success: true, data: announcements });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (state_id) {
        whereConditions.state_id = state_id;
      }
      if (search && search.trim()) {
        whereConditions.text = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `announcements_${state_id || "global"}_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Announcement.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: CareerStates,
            as: "state",
            attributes: ["state_name"],
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
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

      const { text, is_active } = req.body;
      // Normalize state_id: empty string or falsy → null, truthy → number
      const state_id = req.body.state_id !== undefined ? (req.body.state_id && req.body.state_id !== "" ? Number(req.body.state_id) : null) : announcement.state_id;
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
        state_id,
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
