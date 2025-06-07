const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const GoldLoanBannerFeatures = models.GoldloanBannerFeatures;

class GoldLoanBannerFeaturesController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.icon = `/uploads/gold-loan-banner-features/${req.file.filename}`;
        Logger.info(`Uploaded icon for GoldLoanBannerFeature: ${updateData.icon}`);
      }

      const feature = await GoldLoanBannerFeatures.create(updateData);

      await CacheService.invalidate("goldLoanBannerFeatures");
      await CacheService.invalidate("webGoldLoan");
      res.status(201).json({ success: true, data: feature, message: "Gold Loan Banner Feature created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "goldLoanBannerFeatures";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const features = await GoldLoanBannerFeatures.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(features), 3600);
      res.json({ success: true, data: features });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanBannerFeature_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const feature = await GoldLoanBannerFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Banner Feature not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(feature), 3600);
      res.json({ success: true, data: feature });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const feature = await GoldLoanBannerFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Banner Feature not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = feature.icon;

      if (req.file) {
        updateData.icon = `/uploads/gold-loan-banner-features/${req.file.filename}`;
        Logger.info(`Updated icon for GoldLoanBannerFeature ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await GoldLoanBannerFeaturesController.deleteFile(oldIcon);
        }
      }

      await feature.update(updateData);

      await CacheService.invalidate("goldLoanBannerFeatures");
      await CacheService.invalidate(`goldLoanBannerFeature_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: feature, message: "Gold Loan Banner Feature updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const feature = await GoldLoanBannerFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Banner Feature not found", 404);
      }

      const oldIcon = feature.icon;
      await feature.destroy();

      if (oldIcon) {
        await GoldLoanBannerFeaturesController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("goldLoanBannerFeatures");
      await CacheService.invalidate(`goldLoanBannerFeature_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, message: "Gold Loan Banner Feature deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanBannerFeaturesController;
