const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldLoanScheme = models.GoldLoanScheme;

class GoldLoanSchemeController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const scheme = await GoldLoanScheme.create(updateData);

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate("webGoldLoan");

      res.status(201).json({ success: true, data: scheme, message: "Gold Loan Scheme created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "goldLoanSchemes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const schemes = await GoldLoanScheme.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(schemes), 3600);
      res.json({ success: true, data: schemes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanScheme_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(scheme), 3600);
      res.json({ success: true, data: scheme });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      const updateData = { ...req.body };

      await scheme.update(updateData);

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate(`goldLoanScheme_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: scheme, message: "Gold Loan Scheme updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const scheme = await GoldLoanScheme.findByPk(id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      await scheme.destroy();

      await CacheService.invalidate("goldLoanSchemes");
      await CacheService.invalidate(`goldLoanScheme_${id}`);
      await CacheService.invalidate("webGoldLoan");
      res.json({ success: true, message: "Gold Loan Scheme deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanSchemeController;
