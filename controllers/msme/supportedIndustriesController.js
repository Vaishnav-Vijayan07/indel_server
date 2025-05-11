const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MsmeLoanSupportedIndustries = models.MsmeLoanSupportedIndustries;

class MsmeLoanSupportedIndustriesController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "Uploads", filePath.replace("/uploads/", ""));
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
        updateData.icon = `/uploads/msme-loan-supported-industries/${req.file.filename}`;
        Logger.info(`Uploaded icon for MsmeLoanSupportedIndustry: ${updateData.icon}`);
      }

      const industry = await MsmeLoanSupportedIndustries.create(updateData);

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      res.status(201).json({ success: true, data: industry, message: "MSME Loan Supported Industry created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeLoanSupportedIndustries";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const industries = await MsmeLoanSupportedIndustries.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(industries), 3600);
      res.json({ success: true, data: industries });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `msmeLoanSupportedIndustry_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(industry), 3600);
      res.json({ success: true, data: industry });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = industry.icon;

      if (req.file) {
        updateData.icon = `/uploads/msme-loan-supported-industries/${req.file.filename}`;
        Logger.info(`Updated icon for MsmeLoanSupportedIndustry ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await MsmeLoanSupportedIndustriesController.deleteFile(oldIcon);
        }
      }

      await industry.update(updateData);

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      await CacheService.invalidate(`msmeLoanSupportedIndustry_${id}`);
      res.json({ success: true, data: industry, message: "MSME Loan Supported Industry updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      const oldIcon = industry.icon;
      await industry.destroy();

      if (oldIcon) {
        await MsmeLoanSupportedIndustriesController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      await CacheService.invalidate(`msmeLoanSupportedIndustry_${id}`);
      res.json({ success: true, message: "MSME Loan Supported Industry deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeLoanSupportedIndustriesController;
