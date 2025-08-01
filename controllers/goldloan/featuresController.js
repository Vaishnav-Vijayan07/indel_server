const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const GoldLoanFeatures = models.GoldLoanFeatures;

class GoldLoanFeaturesController {
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
        updateData.icon = `/uploads/gold-loan-features/${req.file.filename}`;
        Logger.info(`Uploaded icon for GoldLoanFeature: ${updateData.icon}`);
      }

      const feature = await GoldLoanFeatures.create(updateData);

      await CacheService.invalidate("goldLoanFeatures");
      await CacheService.invalidate("webGoldLoan");

      res.status(201).json({ success: true, data: feature, message: "Gold Loan Feature created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "goldLoanFeatures";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        Logger.info("Returning cached data for goldLoanFeatures");
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const features = await GoldLoanFeatures.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(features), 3600);
      Logger.info("Fetched goldLoanFeatures from database and cached the result");
      res.json({ success: true, data: features });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `goldLoanFeature_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const feature = await GoldLoanFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Feature not found", 404);
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
      const feature = await GoldLoanFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Feature not found", 404);
      }

      const updateData = { ...req.body };
      const { is_center } = updateData;

      

      let oldIcon = feature.icon;

      if (req.file) {
        updateData.icon = `/uploads/gold-loan-features/${req.file.filename}`;
        Logger.info(`Updated icon for GoldLoanFeature ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await GoldLoanFeaturesController.deleteFile(oldIcon);
        }
      }

      if (is_center === 'true') {
        await GoldLoanFeatures.update(
          { is_center: false },
          { where: { is_center: true, id: { [Op.ne]: id } } }
        );
        Logger.info(`Set isActive to false for all items except ID ${id}`);
      }

      await feature.update(updateData);

      await CacheService.invalidate("goldLoanFeatures");
      await CacheService.invalidate(`goldLoanFeature_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: feature, message: "Gold Loan Feature updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const feature = await GoldLoanFeatures.findByPk(id);
      if (!feature) {
        throw new CustomError("Gold Loan Feature not found", 404);
      }

      const oldIcon = feature.icon;
      await feature.destroy();

      if (oldIcon) {
        await GoldLoanFeaturesController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("goldLoanFeatures");
      await CacheService.invalidate(`goldLoanFeature_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, message: "Gold Loan Feature deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
  static async updateItemCenterStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_center } = req.body;



      const item = await GoldLoanFeatures.findByPk(id);
      if (!item) {
        throw new CustomError("Item not found", 404);
      }

      // If setting to true, make all other items' isActive false
      if (is_center === true) {
        await GoldLoanFeatures.update(
          { is_center: false },
          { where: { is_center: true, id: { [Op.ne]: id } } }
        );
        Logger.info(`Set isActive to false for all items except ID ${id}`);
      }

      // Update the current item
      await item.update({ is_center });

      // Invalidate relevant caches
      await CacheService.invalidate("goldLoanFeatures");
      await CacheService.invalidate(`goldLoanFeature_${id}`);
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: item, message: "Item active status updated" });
    } catch (error) {
      next(error);
    }
  }
}


module.exports = GoldLoanFeaturesController;
