const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AnnualReport = models.AnnualReport;

class AnnualReportController {
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
      data.file = `/uploads/annual-reports/${req.file.filename}`;
      Logger.info(`Uploaded file for Annual Report: ${data.file}`);

      const annualReport = await AnnualReport.create(data);
      await CacheService.invalidate("AnnualReport");
      await CacheService.invalidate("webCsrReports");
      res.status(201).json({ success: true, data: annualReport, message: "Annual Report created" });
    } catch (error) {
      if (req.file) {
        await AnnualReportController.deleteFile(`/uploads/annual-reports/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "AnnualReport";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const annualReports = await AnnualReport.findAll({
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", "is_active"] }],
        order: [["order", "ASC"]],
      });
      // await CacheService.set(cacheKey, JSON.stringify(annualReports), 3600);
      res.json({ success: true, data: annualReports });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `annualReport_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const annualReport = await AnnualReport.findByPk(id, {
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year", "is_active"] }],
      });
      if (!annualReport) {
        throw new CustomError("Annual Report not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(annualReport), 3600);
      res.json({ success: true, data: annualReport });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const annualReport = await AnnualReport.findByPk(id);
      if (!annualReport) {
        throw new CustomError("Annual Report not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = annualReport.file;

      if (req.file) {
        updateData.file = `/uploads/annual-reports/${req.file.filename}`;
        Logger.info(`Updated file for Annual Report ID ${id}: ${updateData.file}`);
        if (oldFile) {
          await AnnualReportController.deleteFile(oldFile);
        }
      }

      await annualReport.update(updateData);
      await CacheService.invalidate("AnnualReport");
      await CacheService.invalidate("webCsrReports");
      await CacheService.invalidate(`annualReport_${id}`);
      res.json({ success: true, data: annualReport, message: "Annual Report updated" });
    } catch (error) {
      if (req.file) {
        await AnnualReportController.deleteFile(`/uploads/annual-reports/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const annualReport = await AnnualReport.findByPk(id);
      if (!annualReport) {
        throw new CustomError("Annual Report not found", 404);
      }

      const oldFile = annualReport.file;
      await annualReport.destroy();

      if (oldFile) {
        await AnnualReportController.deleteFile(oldFile);
      }

      await CacheService.invalidate("AnnualReport");
      await CacheService.invalidate("webCsrReports");
      await CacheService.invalidate(`annualReport_${id}`);
      res.json({ success: true, message: "Annual Report deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnnualReportController;