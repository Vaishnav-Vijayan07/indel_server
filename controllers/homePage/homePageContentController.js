const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const HomePageContent = models.HomePageContent;

class HomePageContentController {
  static async get(req, res, next) {
    try {
      const cacheKey = "homePageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await HomePageContent.findOne();
      if (!content) {
        throw new CustomError("Home Page Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await HomePageContent.findOne();
      if (!content) {
        throw new CustomError("Home Page Content not found", 404);
      }

      const updateData = { ...req.body };
      if (req.files) {
        if (req.files.gold_rate_icon) {
          updateData.gold_rate_icon = `/uploads/home-page-content/${req.files.gold_rate_icon[0].filename}`;
        }
        if (req.files.about_image) {
          updateData.about_image_url = `/uploads/home-page-content/${req.files.about_image[0].filename}`;
        }
        if (req.files.investment_image) {
          updateData.investment_image_url = `/uploads/home-page-content/${req.files.investment_image[0].filename}`;
        }
        if (req.files.mobile_app_image) {
          updateData.mobile_app_image_url = `/uploads/home-page-content/${req.files.mobile_app_image[0].filename}`;
        }
        if (req.files.faq_section_image) {
          updateData.faq_section_image = `/uploads/home-page-content/${req.files.faq_section_image[0].filename}`;
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("homePageContent");
      await CacheService.invalidate("webHomeData");

      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomePageContentController;
