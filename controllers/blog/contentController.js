const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const BlogPageContent = models.BlogPageContent;

class BlogPageContentController {
  static async get(req, res, next) {
    try {
      const cacheKey = "BlogPageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await BlogPageContent.findOne();
      if (!content) {
        throw new CustomError("Blog Page Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await BlogPageContent.findOne();
      if (!content) {
        throw new CustomError("Blog Page Content not found", 404);
      }

      const updateData = { ...req.body };

      await content.update(updateData);

      await CacheService.invalidate("BlogPageContent");
      res.json({ success: true, data: content, message: "Blog Page Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BlogPageContentController;
