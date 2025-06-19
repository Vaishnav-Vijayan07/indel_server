const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AnnualReturns = models.AnnualReturns;

class AnnualReturnsController {
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
      const data = { ...req.body };
      if (!req.file) {
        throw new CustomError("File is required", 400);
      }
      data.file = `/uploads/investors/annual-returns/${req.file.filename}`;
      Logger.info(`Uploaded file for Annual Returns: ${data.file}`);

      const annualReturns = await AnnualReturns.create(data);
      await CacheService.invalidate("AnnualReturns");
      await CacheService.invalidate("webCsrReports");
      res.status(201).json({ success: true, data: annualReturns, message: "Annual Returns created" });
    } catch (error) {
      if (req.file) {
        await AnnualReturnsController.deleteFile(`/uploads/investors/annual-returns/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "AnnualReturns";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const annualReturns = await AnnualReturns.findAll({
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
        order: [["order", "ASC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(annualReturns), 3600);
      res.json({ success: true, data: annualReturns });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `annualReturns_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const annualReturns = await AnnualReturns.findByPk(id, {
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
      });
      if (!annualReturns) {
        throw new CustomError("Annual Returns not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(annualReturns), 3600);
      res.json({ success: true, data: annualReturns });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const annualReturns = await AnnualReturns.findByPk(id);
      if (!annualReturns) {
        throw new CustomError("Annual Returns not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = annualReturns.file;

      if (req.file) {
        updateData.file = `/uploads/investors/annual-returns/${req.file.filename}`;
        Logger.info(`Updated file for Annual Returns ID ${id}: ${updateData.file}`);
        if (oldFile) {
          await AnnualReturnsController.deleteFile(oldFile);
        }
      }

      await annualReturns.update(updateData);
      await CacheService.invalidate("AnnualReturns");
      await CacheService.invalidate("webCsrReports");
      await CacheService.invalidate(`annualReturns_${id}`);
      res.json({ success: true, data: annualReturns, message: "Annual Returns updated" });
    } catch (error) {
      if (req.file) {
        await AnnualReturnsController.deleteFile(`/uploads/investors/annual-returns/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const annualReturns = await AnnualReturns.findByPk(id);
      if (!annualReturns) {
        throw new CustomError("Annual Returns not found", 404);
      }

      const oldFile = annualReturns.file;
      await annualReturns.destroy();

      if (oldFile) {
        await AnnualReturnsController.deleteFile(oldFile);
      }

      await CacheService.invalidate("AnnualReturns");
      await CacheService.invalidate("webCsrReports");
      await CacheService.invalidate(`annualReturns_${id}`);
      res.json({ success: true, message: "Annual Returns deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnnualReturnsController;
