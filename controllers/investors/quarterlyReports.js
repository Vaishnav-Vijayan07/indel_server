const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const QuarterlyReports = models.QuarterlyReports;

class QuarterlyReportsController {
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
                updateData.file = `/uploads/quarterly-reports/${req.file.filename}`;
                Logger.info(`Uploaded file for QuarterlyReport: ${updateData.file}`);
            }

            const report = await QuarterlyReports.create(updateData);

            await CacheService.invalidate("quarterlyReports");
            res.status(201).json({ success: true, data: report, message: "Quarterly Report created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const cacheKey = "quarterlyReports";
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const reports = await QuarterlyReports.findAll({
                attributes: ["id", "title", "year", "file", "is_active", "order"],
                include: [
                    { model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] },

                ],
                order: [["order", "ASC"]],
            });

            await CacheService.set(cacheKey, JSON.stringify(reports), 3600);
            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const cacheKey = `quarterlyReport_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const report = await QuarterlyReports.findByPk(id, {
                include: [
                    { model: models.FiscalYears, as: "fiscalYear" },
                ],
            });
            if (!report) {
                throw new CustomError("Quarterly Report not found", 404);
            }

            await CacheService.set(cacheKey, JSON.stringify(report), 3600);
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const report = await QuarterlyReports.findByPk(id);
            if (!report) {
                throw new CustomError("Quarterly Report not found", 404);
            }

            const updateData = { ...req.body };
            let oldFile = report.file;

            if (req.file) {
                updateData.file = `/uploads/quarterly-reports/${req.file.filename}`;
                Logger.info(`Updated file for QuarterlyReport ID ${id}: ${updateData.file}`);
                if (oldFile) {
                    await QuarterlyReportsController.deleteFile(oldFile);
                }
            }

            await report.update(updateData);

            await CacheService.invalidate("quarterlyReports");
            await CacheService.invalidate(`quarterlyReport_${id}`);
            res.json({ success: true, data: report, message: "Quarterly Report updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const report = await QuarterlyReports.findByPk(id);
            if (!report) {
                throw new CustomError("Quarterly Report not found", 404);
            }

            const oldFile = report.file;
            await report.destroy();

            if (oldFile) {
                await QuarterlyReportsController.deleteFile(oldFile);
            }

            await CacheService.invalidate("quarterlyReports");
            await CacheService.invalidate(`quarterlyReport_${id}`);
            res.json({ success: true, message: "Quarterly Report deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = QuarterlyReportsController;