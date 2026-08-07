const { models } = require("../../models/index");
const { Op } = require("sequelize");
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
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "goldLoanBannerFeatures";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const features = await GoldLoanBannerFeatures.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(features), 3600);
        return res.json({ success: true, data: features });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `goldLoanBannerFeatures_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await GoldLoanBannerFeatures.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
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
