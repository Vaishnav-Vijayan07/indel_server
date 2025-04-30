const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const AboutPageContent = models.AboutPageContent;

class AboutPageContentController {
  static async get(req, res, next) {
    try {
      const cacheKey = "aboutPageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await AboutPageContent.findOne();
      if (!content) {
        throw new CustomError("About Page Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await AboutPageContent.findOne();
      if (!content) {
        throw new CustomError("About Page Content not found", 404);
      }

      const updateData = { ...req.body };

      // Example image field handling (you can extend this based on actual file fields)
      if (req.files) {
        if (req.files.investors_image_1) {
          updateData.investors_image_1 = `/uploads/about-page-content/${req.files.investors_image_1[0].filename}`;
        }
        if (req.files.investors_image_2) {
          updateData.investors_image_2 = `/uploads/about-page-content/${req.files.investors_image_2[0].filename}`;
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("aboutPageContent");
      res.json({ success: true, data: content,message: "About Page Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutPageContentController;
