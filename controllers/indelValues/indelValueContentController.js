const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const IndelValueContent = models.IndelValueContent;

class IndelValueContentController {
  static async get(req, res, next) {
    try {
      const cacheKey = "IndelValueContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await IndelValueContent.findOne();
      if (!content) {
        throw new CustomError("Indel value content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await IndelValueContent.findOne();
      if (!content) {
        throw new CustomError("Indel value content not found", 404);
      }

      const updateData = { ...req.body };

      await content.update(updateData);

      await CacheService.invalidate("IndelValueContent");
      await CacheService.invalidate("webIndelValueData");

      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IndelValueContentController;
