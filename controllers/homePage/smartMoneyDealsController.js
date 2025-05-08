const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const SmartMoneyDeals = models.SmartMoneyDeals;

class SmartMoneyDealsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..","..", "uploads", filePath.replace("/uploads/", ""));
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
        updateData.icon = `/uploads/home-smart-deals/${req.file.filename}`;
        Logger.info(`Uploaded icon for SmartMoneyDeal: ${updateData.icon}`);
      }

      const deal = await SmartMoneyDeals.create(updateData);

      await CacheService.invalidate("smartMoneyDeals");
      res.status(201).json({ success: true, data: deal,message: "Smart Money Deal created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "smartMoneyDeals";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const deals = await SmartMoneyDeals.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(deals), 3600);
      res.json({ success: true, data: deals });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `smartMoneyDeal_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const deal = await SmartMoneyDeals.findByPk(id);
      if (!deal) {
        throw new CustomError("Smart Money Deal not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(deal), 3600);
      res.json({ success: true, data: deal });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const deal = await SmartMoneyDeals.findByPk(id);
      if (!deal) {
        throw new CustomError("Smart Money Deal not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = deal.icon;

      if (req.file) {
        updateData.icon = `/uploads/home-smart-deals/${req.file.filename}`;
        Logger.info(`Updated icon for SmartMoneyDeal ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await SmartMoneyDealsController.deleteFile(oldIcon);
        }
      }

      await deal.update(updateData);

      await CacheService.invalidate("smartMoneyDeals");
      await CacheService.invalidate(`smartMoneyDeal_${id}`);
      res.json({ success: true, data: deal, message: "Smart Money Deal updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deal = await SmartMoneyDeals.findByPk(id);
      if (!deal) {
        throw new CustomError("Smart Money Deal not found", 404);
      }

      const oldIcon = deal.icon;
      await deal.destroy();

      if (oldIcon) {
        await SmartMoneyDealsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("smartMoneyDeals");
      await CacheService.invalidate(`smartMoneyDeal_${id}`);
      res.json({ success: true, message: "Smart Money Deal deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SmartMoneyDealsController;
