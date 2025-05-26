const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const MsmeLoanContent = models.MsmeLoanContent;

class MsmeLoanContentController {
  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeLoanContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const data = await MsmeLoanContent.findOne();
      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const entry = await MsmeLoanContent.findOne();
      if (!entry) throw new CustomError("MSME Loan Content not found", 404);

      const updateData = { ...req.body };

      await entry.update(updateData);

      await CacheService.invalidate("msmeLoanContent");
      await CacheService.invalidate("webMSMELoan");
      res.json({ success: true, data: entry, message: "MSME Loan Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeLoanContentController;
