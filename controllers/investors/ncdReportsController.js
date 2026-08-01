const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const slugify = require("../../utils/slugify");
const fs = require("fs").promises;
const path = require("path");

const NcdReports = models.NcdReports;
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "ncd-reports");

class NcdReportsController {
    static async resolveUniqueFilename(base, ext) {
        let candidate = `${base}${ext}`;
        let suffix = 2;
        while (true) {
            try {
                await fs.access(path.join(UPLOAD_DIR, candidate));
                candidate = `${base}-${suffix}${ext}`;
                suffix += 1;
            } catch {
                return candidate;
            }
        }
    }

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
                const base = slugify(req.body.title) || path.parse(req.file.filename).name;
                const ext = path.extname(req.file.originalname);
                const filename = await NcdReportsController.resolveUniqueFilename(base, ext);

                await fs.rename(req.file.path, path.join(UPLOAD_DIR, filename));

                updateData.file = `/uploads/ncd-reports/${filename}`;
                Logger.info(`Uploaded file for NcdReport: ${updateData.file}`);
            }

            const report = await NcdReports.create(updateData);

            await CacheService.invalidate("ncdReports");
            res.status(201).json({ success: true, data: report, message: "NCD Report created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const cacheKey = "ncdReports";
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const reports = await NcdReports.findAll({
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
            const cacheKey = `ncdReport_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const report = await NcdReports.findByPk(id);
            if (!report) {
                throw new CustomError("NCD Report not found", 404);
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
            const report = await NcdReports.findByPk(id);
            if (!report) {
                throw new CustomError("NCD Report not found", 404);
            }

            const updateData = { ...req.body };
            let oldFile = report.file;

            if (req.file) {
                const newExt = path.extname(req.file.originalname);

                if (oldFile) {
                    const oldFilename = path.basename(oldFile);
                    const oldBase = path.parse(oldFilename).name;
                    const oldExt = path.extname(oldFilename);

                    if (newExt === oldExt) {
                        await fs.rename(req.file.path, path.join(UPLOAD_DIR, oldFilename));
                        updateData.file = oldFile;
                    } else {
                        const filename = `${oldBase}${newExt}`;
                        await fs.rename(req.file.path, path.join(UPLOAD_DIR, filename));
                        updateData.file = `/uploads/ncd-reports/${filename}`;
                        await NcdReportsController.deleteFile(oldFile);
                    }
                } else {
                    const base = slugify(updateData.title ?? report.title) || path.parse(req.file.filename).name;
                    const filename = await NcdReportsController.resolveUniqueFilename(base, newExt);
                    await fs.rename(req.file.path, path.join(UPLOAD_DIR, filename));
                    updateData.file = `/uploads/ncd-reports/${filename}`;
                }

                Logger.info(`Updated file for NcdReport ID ${id}: ${updateData.file}`);
            }

            await report.update(updateData);

            await CacheService.invalidate("ncdReports");
            await CacheService.invalidate(`ncdReport_${id}`);
            res.json({ success: true, data: report, message: "NCD Report updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const report = await NcdReports.findByPk(id);
            if (!report) {
                throw new CustomError("NCD Report not found", 404);
            }

            const oldFile = report.file;
            await report.destroy();

            if (oldFile) {
                await NcdReportsController.deleteFile(oldFile);
            }

            await CacheService.invalidate("ncdReports");
            await CacheService.invalidate(`ncdReport_${id}`);
            res.json({ success: true, message: "NCD Report deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NcdReportsController;