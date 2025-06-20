const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const loanAgainstPropertyFaqs = models.LoanAgainstPropertyFaq;

class loanAgainstPropertyFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await loanAgainstPropertyFaqs.create(updateData);

      await CacheService.invalidate("loanAgainstPropertyFaqs");
      await CacheService.invalidate("webLoanAgainstProperty");
      res.status(201).json({ success: true, data: faq, message: "Loan Against Property FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    const { stateId } = req.query;
    try {
      const cacheKey = "loanAgainstPropertyFaqs";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const whereClause = {
        is_active: true,
        ...(stateId && { state_id: Number(stateId) }),
      };

      const faqs = await loanAgainstPropertyFaqs.findAll({
        where: whereClause,
        include: [{ model: States, attributes: ["state_name"], as: "state" }],
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
      const cacheKey = `loanAgainstPropertyFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await loanAgainstPropertyFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Loan Against Property FAQ not found", 404);
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
      const faq = await loanAgainstPropertyFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Loan Against Property FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      await CacheService.invalidate("loanAgainstPropertyFaqs");
      await CacheService.invalidate("webLoanAgainstProperty");
      await CacheService.invalidate(`loanAgainstPropertyFaq_${id}`);
      res.json({ success: true, data: faq, message: "Loan Against Property FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await loanAgainstPropertyFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("Loan Against Property FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("loanAgainstPropertyFaqs");
      await CacheService.invalidate("webLoanAgainstProperty");
      await CacheService.invalidate(`loanAgainstPropertyFaq_${id}`);
      res.json({ success: true, message: "Loan Against Property FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = loanAgainstPropertyFaqsController;
