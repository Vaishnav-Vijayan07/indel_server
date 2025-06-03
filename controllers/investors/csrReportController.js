const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CsrReport = models.CsrReport;

class CsrReportController {
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
      const data = { ...req.body };
      if (!req.file) {
        throw new CustomError("Report document is required", 400);
      }
      data.report = `/uploads/investors/csr-reports/${req.file.filename}`;
      Logger.info(`Uploaded file for CSR Report: ${data.report}`);

      const csrReport = await CsrReport.create(data);
      await CacheService.invalidate("CsrReport");
      await CacheService.invalidate("webCsrDetails");
      res.status(201).json({ success: true, data: csrReport, message: "CSR Report created" });
    } catch (error) {
      if (req.file) {
        await CsrReportController.deleteFile(`/uploads/investors/csr-reports/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "CsrReport";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csrReports = await CsrReport.findAll({
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
        order: [[{ model: models.FiscalYears, as: "fiscalYear" }, "fiscal_year", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(csrReports), 3600);
      res.json({ success: true, data: csrReports });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `csrReport_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csrReport = await CsrReport.findByPk(id);
      if (!csrReport) {
        throw new CustomError("CSR Report not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(csrReport), 3600);
      res.json({ success: true, data: csrReport });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const csrReport = await CsrReport.findByPk(id);
      if (!csrReport) {
        throw new CustomError("CSR Report not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = csrReport.report;

      if (req.file) {
        updateData.report = `/uploads/investors/csr-reports/${req.file.filename}`;
        Logger.info(`Updated file for CSR Report ID ${id}: ${updateData.report}`);
        if (oldFile) {
          await CsrReportController.deleteFile(oldFile);
        }
      }

      await csrReport.update(updateData);
      await CacheService.invalidate("CsrReport");
      await CacheService.invalidate("webCsrDetails");
      await CacheService.invalidate(`csrReport_${id}`);
      res.json({ success: true, data: csrReport, message: "CSR Report updated" });
    } catch (error) {
      if (req.file) {
        await CsrReportController.deleteFile(`/uploads/investors/csr-reports/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const csrReport = await CsrReport.findByPk(id);
      if (!csrReport) {
        throw new CustomError("CSR Report not found", 404);
      }

      const oldFile = csrReport.report;
      await csrReport.destroy();

      if (oldFile) {
        await CsrReportController.deleteFile(oldFile);
      }

      await CacheService.invalidate("CsrReport");
      await CacheService.invalidate("webCsrDetails");
      await CacheService.invalidate(`csrReport_${id}`);
      res.json({ success: true, message: "CSR Report deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrReportController;