const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const ContactFaq = models.ContactFaq;

class ContactFaqController {
  static async create(req, res, next) {
    try {
      const faq = await ContactFaq.create(req.body);

      await CacheService.invalidate("ContactFaqs");
      res.status(201).json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ContactFaqs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faqs = await ContactFaq.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(faqs), 3600);
      res.json({ success: true, data: faqs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `ContactFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(faq), 3600);
      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
      }

      await faq.update(req.body);

      await CacheService.invalidate("ContactFaqs");
      await CacheService.invalidate(`ContactFaq_${id}`);
      res.json({ success: true, data: faq,message: "Contact FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await ContactFaq.findByPk(id);
      if (!faq) {
        throw new CustomError("Contact FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("ContactFaqs");
      await CacheService.invalidate(`ContactFaq_${id}`);
      res.json({ success: true, message: "Contact FAQ deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContactFaqController;
