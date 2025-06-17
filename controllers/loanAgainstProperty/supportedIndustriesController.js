const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanAgainstPropertySupportedIndustries = models.LoanAgainstPropertySupportedIndustries;

class LoanAgainstPropertySupportedIndustriesController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);initLOanAgainstPropertyContent
      if (req.file) {
        updateData.icon = `/uploads/loan-against-property-supported-industries/${req.file.filename}`;
        Logger.info(`Uploaded icon for LoanAgainstPropertySupportedIndustry: ${updateData.icon}`);
      }

      const industry = await LoanAgainstPropertySupportedIndustries.create(updateData);

      await CacheService.invalidate("loanAgainstPropertySupportedIndustries");
      res.status(201).json({ success: true, data: industry, message: "Loan Against Property Supported Industry created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "loanAgainstPropertySupportedIndustries";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const industries = await LoanAgainstPropertySupportedIndustries.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(industries), 3600);
      res.json({ success: true, data: industries });
    } catch (error) {
      next(error);
    }
  }


  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.icon = `/uploads/loan-against-property-supported-industries/${req.file.filename}`;
        Logger.info(`Uploaded icon for LoanAgainstPropertySupportedIndustry: ${updateData.icon}`);
      }

      const industry = await LoanAgainstPropertySupportedIndustries.create(updateData);

      await CacheService.invalidate("loanAgainstPropertySupportedIndustries");
      res.status(201).json({ success: true, data: industry, message: "Loan against property Supported Industry created" });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `loanAgainstPropertySupportedIndustries_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const industry = await LoanAgainstPropertySupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("Loan Against Property Supported Industry not found", 404);
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
      const industry = await LoanAgainstPropertySupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("Loan Against Property Supported Industry not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = industry.icon;

      if (req.file) {
        updateData.icon = `/uploads/loan-against-property-supported-industries/${req.file.filename}`;
        Logger.info(`Updated icon for LoanAgainstPropertySupportedIndustry ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await LoanAgainstPropertySupportedIndustriesController.deleteFile(oldIcon);
        }
      }

      await industry.update(updateData);

      await CacheService.invalidate("loanAgainstPropertySupportedIndustries");
      await CacheService.invalidate(`loanAgainstPropertySupportedIndustries_${id}`);
      res.json({ success: true, data: industry, message: "Loan Against Property Supported Industry updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const industry = await LoanAgainstPropertySupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("Loan Against Property Supported Industry not found", 404);
      }

      const oldIcon = industry.icon;
      await industry.destroy();

      if (oldIcon) {
        await LoanAgainstPropertySupportedIndustriesController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("loanAgainstPropertySupportedIndustries");
      await CacheService.invalidate(`loanAgainstPropertySupportedIndustries_${id}`);
      res.json({ success: true, message: "Loan Against Property Supported Industry deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanAgainstPropertySupportedIndustriesController;
