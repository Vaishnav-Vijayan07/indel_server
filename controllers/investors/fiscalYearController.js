const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const FiscalYears = models.FiscalYears;

class FiscalYearsController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const fiscalYear = await FiscalYears.create(data);
      await CacheService.invalidate("FiscalYears");
      res.status(201).json({ success: true, data: fiscalYear, message: "Fiscal Year created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "FiscalYears";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const fiscalYears = await FiscalYears.findAll({
        order: [["fiscal_year", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(fiscalYears), 3600);
      res.json({ success: true, data: fiscalYears });
    } catch (error) {
      next(error);
    }
  }
  static async getActiveAll(req, res, next) {
    try {
      const cacheKey = "FiscalYears";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const fiscalYears = await FiscalYears.findAll({
        where: { is_active: true },
        order: [["fiscal_year", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(fiscalYears), 3600);
      res.json({ success: true, data: fiscalYears });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `fiscalYear_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const fiscalYear = await FiscalYears.findByPk(id);
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(fiscalYear), 3600);
      res.json({ success: true, data: fiscalYear });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const fiscalYear = await FiscalYears.findByPk(id);
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      const updateData = { ...req.body };
      await fiscalYear.update(updateData);
      await CacheService.invalidate("FiscalYears");
      await CacheService.invalidate(`fiscalYear_${id}`);
      res.json({ success: true, data: fiscalYear, message: "Fiscal Year updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const fiscalYear = await FiscalYears.findByPk(id);

      console.log(fiscalYear);
      if (!fiscalYear) {
        throw new CustomError("Fiscal Year not found", 404);
      }

      await fiscalYear.destroy();
      await CacheService.invalidate("FiscalYears");
      await CacheService.invalidate(`fiscalYear_${id}`);
      res.json({ success: true, message: "Fiscal Year deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FiscalYearsController;
