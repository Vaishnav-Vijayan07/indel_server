const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const EventTypes = models.EventTypes;

class EventTypesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const eventType = await EventTypes.create(data);
      await CacheService.invalidate("EventTypes");
      res.status(201).json({ success: true, data: eventType, message: "Event Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "EventTypes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const eventTypes = await EventTypes.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(eventTypes), 3600);
      res.json({ success: true, data: eventTypes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `eventType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const eventType = await EventTypes.findByPk(id);
      if (!eventType) {
        throw new CustomError("Event Type not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(eventType), 3600);
      res.json({ success: true, data: eventType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const eventType = await EventTypes.findByPk(id);
      if (!eventType) {
        throw new CustomError("Event Type not found", 404);
      }

      const updateData = { ...req.body };
      await eventType.update(updateData);
      await CacheService.invalidate("EventTypes");
      await CacheService.invalidate(`eventType_${id}`);
      res.json({ success: true, data: eventType, message: "Event Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const eventType = await EventTypes.findByPk(id);
      if (!eventType) {
        throw new CustomError("Event Type not found", 404);
      }

      await eventType.destroy();
      await CacheService.invalidate("EventTypes");
      await CacheService.invalidate(`eventType_${id}`);
      res.json({ success: true, message: "Event Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EventTypesController;
