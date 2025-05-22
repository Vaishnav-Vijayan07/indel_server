const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const GoldLoanSchemeDetails = models.SchemeDetails;

class GoldLoanSchemeDetailsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { scheme_id } = req.body;
      const scheme = await models.GoldLoanScheme.findByPk(scheme_id);
      if (!scheme) {
        throw new CustomError("Gold Loan Scheme not found", 404);
      }

      const schemeDetail = await GoldLoanSchemeDetails.create(updateData);

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate("webGoldLoan");

      res.status(201).json({ success: true, data: schemeDetail, message: "Gold Loan Scheme Detail created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "goldLoanSchemeDetails";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const schemeDetails = await GoldLoanSchemeDetails.findAll({
        order: [["order", "ASC"]],
        include: [{ model: models.GoldLoanScheme, as: "goldLoanScheme" }],
      });

      await CacheService.set(cacheKey, JSON.stringify(schemeDetails), 3600);
      res.json({ success: true, data: schemeDetails });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanSchemeDetail_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id, {
        include: [{ model: models.GoldLoanScheme, as: "goldLoanScheme" }],
      });
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(schemeDetail), 3600);
      res.json({ success: true, data: schemeDetail });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id);
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      const updateData = { ...req.body };

      await schemeDetail.update(updateData);

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate(`goldLoanSchemeDetail_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: schemeDetail, message: "Gold Loan Scheme Detail updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const schemeDetail = await GoldLoanSchemeDetails.findByPk(id);
      if (!schemeDetail) {
        throw new CustomError("Gold Loan Scheme Detail not found", 404);
      }

      await schemeDetail.destroy();

      await CacheService.invalidate("goldLoanSchemeDetails");
      await CacheService.invalidate(`goldLoanSchemeDetail_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, message: "Gold Loan Scheme Detail deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanSchemeDetailsController;
