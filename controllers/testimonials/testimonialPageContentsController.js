const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const TestimonialPageContents = models.TestimonialPageContent;

class TestimonialPageContentsController {
  static async get(req, res, next) {
    try {
      const cacheKey = "TestimonialPageContents";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const testimonialPageContent = await TestimonialPageContents.findOne();
      await CacheService.set(cacheKey, JSON.stringify(testimonialPageContent), 3600);
      res.json({ success: true, data: testimonialPageContent });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const data = { ...req.body };
      let testimonialPageContent = await TestimonialPageContents.findOne();

      if (testimonialPageContent) {
        await testimonialPageContent.update(data);
      } else {
        testimonialPageContent = await TestimonialPageContents.create(data);
      }

      await CacheService.invalidate("TestimonialPageContents");
      res.json({ success: true, data: testimonialPageContent, message: "Testimonial Page Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TestimonialPageContentsController;
