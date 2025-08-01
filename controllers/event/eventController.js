const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

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
      const cacheKey = "Event";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const events = await Event.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(events), 3600);
      res.json({ success: true, data: events });
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