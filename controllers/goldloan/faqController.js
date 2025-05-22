const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldLoanFaqs = models.GoldLoanFaq;

class GoldLoanFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await GoldLoanFaqs.create(updateData);

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate("webGoldLoan");

      res.status(201).json({ success: true, data: faq, message: "Gold Loan FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "goldLoanFaqs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faqs = await GoldLoanFaqs.findAll({
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
      const cacheKey = `goldLoanFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
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
      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate(`goldLoanFaq_${id}`);
      await CacheService.invalidate("webGoldLoan");
      res.json({ success: true, data: faq, message: "Gold Loan FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await GoldLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Gold Loan FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("goldLoanFaqs");
      await CacheService.invalidate(`goldLoanFaq_${id}`);
      await CacheService.invalidate("webGoldLoan");
      res.json({ success: true, message: "Gold Loan FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanFaqsController;
