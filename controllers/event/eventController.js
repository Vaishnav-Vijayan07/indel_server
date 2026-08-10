const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const Event = models.Events;

class EventController {
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
      if (!req.file) {
        throw new CustomError("Image is required", 400);
      }
      data.image = `/uploads/events/${req.file.filename}`;
      Logger.info(`Uploaded image for Event: ${data.image}`);

      const event = await Event.create(data);
      await CacheService.invalidate("Event");
      res.status(201).json({ success: true, data: event, message: "Event created" });
    } catch (error) {
      if (req.file) {
        await EventController.deleteFile(`/uploads/events/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Event";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const events = await Event.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(events), 3600);
        return res.json({ success: true, data: events });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `Event_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Event.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `event_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const event = await Event.findByPk(id);
      if (!event) {
        throw new CustomError("Event not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(event), 3600);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        throw new CustomError("Event not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = event.image;

      if (req.file) {
        updateData.image = `/uploads/events/${req.file.filename}`;
        Logger.info(`Updated image for Event ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await EventController.deleteFile(oldImage);
        }
      }

      await event.update(updateData);
      await CacheService.invalidate("Event");
      await CacheService.invalidate(`event_${id}`);
      res.json({ success: true, data: event, message: "Event updated" });
    } catch (error) {
      if (req.file) {
        await EventController.deleteFile(`/uploads/events/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        throw new CustomError("Event not found", 404);
      }

      const oldImage = event.image;
      await event.destroy();

      if (oldImage) {
        await EventController.deleteFile(oldImage);
      }

      await CacheService.invalidate("Event");
      await CacheService.invalidate(`event_${id}`);
      res.json({ success: true, message: "Event deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EventController;