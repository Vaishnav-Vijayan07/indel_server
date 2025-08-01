const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const NewsLetterSubs = models.NewsLetterSubs;

class NewsLetterSubsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const log = await NewsLetterSubs.create(updateData);

      await CacheService.invalidate("NewsLetterSubss");
      res.status(201).json({ success: true, data: log, message: "User Activity Log created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "NewsLetterSubss";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const logs = await NewsLetterSubs.findAll({
        order: [["timestamp", "DESC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(logs), 3600);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `NewsLetterSubs_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const log = await NewsLetterSubs.findByPk(id);
      if (!log) {
        throw new CustomError("User Activity Log not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(log), 3600);
      res.json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NewsLetterSubsController;
