const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const MsmeLoanFaqs = models.MsmeLoanFaq;
const States = models.CareerStates;

class MsmeLoanFaqsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const faq = await MsmeLoanFaqs.create(updateData);

      await CacheService.invalidate("msmeLoanFaqs");
      await CacheService.invalidate("webMSMELoan");
      res.status(201).json({ success: true, data: faq, message: "MSME Loan FAQ created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeLoanFaqs";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      let whereClause = { is_active: true };
      if (stateId) {
        whereClause = {
          ...whereClause,
          state_id: Number(stateId),
        };
      }

      const faqs = await MsmeLoanFaqs.findAll({
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
      const cacheKey = `msmeLoanFaq_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const faq = await MsmeLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("MSME Loan FAQ not found", 404);
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
      const faq = await MsmeLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("MSME Loan FAQ not found", 404);
      }

      const updateData = { ...req.body };

      await faq.update(updateData);

      await CacheService.invalidate("msmeLoanFaqs");
      await CacheService.invalidate("webMSMELoan");
      await CacheService.invalidate(`msmeLoanFaq_${id}`);
      res.json({ success: true, data: faq, message: "MSME Loan FAQ updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await MsmeLoanFaqs.findByPk(id);
      if (!faq) {
        throw new CustomError("MSME Loan FAQ not found", 404);
      }

      await faq.destroy();

      await CacheService.invalidate("msmeLoanFaqs");
      await CacheService.invalidate("webMSMELoan");
      await CacheService.invalidate(`msmeLoanFaq_${id}`);
      res.json({ success: true, message: "MSME Loan FAQ deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeLoanFaqsController;
