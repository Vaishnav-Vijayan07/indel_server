const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CorporateGovernance = models.CorporateGovernance;

class CorporateGovernanceController {
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
                updateData.file = `/uploads/corporate-governance/${req.file.filename}`;
                Logger.info(`Uploaded file for CorporateGovernance: ${updateData.file}`);
            }

            const governance = await CorporateGovernance.create(updateData);

            await CacheService.invalidate("corporateGovernance");
            res.status(201).json({ success: true, data: governance, message: "Corporate Governance item created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const cacheKey = "corporateGovernance";
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const governances = await CorporateGovernance.findAll({
                order: [["order", "ASC"]],
            });

            await CacheService.set(cacheKey, JSON.stringify(governances), 3600);
            res.json({ success: true, data: governances });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const cacheKey = `corporateGovernance_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const governance = await CorporateGovernance.findByPk(id);
            if (!governance) {
                throw new CustomError("Corporate Governance item not found", 404);
            }

            await CacheService.set(cacheKey, JSON.stringify(governance), 3600);
            res.json({ success: true, data: governance });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const governance = await CorporateGovernance.findByPk(id);
            if (!governance) {
                throw new CustomError("Corporate Governance item not found", 404);
            }

            const updateData = { ...req.body };
            let oldFile = governance.file;

            if (req.file) {
                updateData.file = `/uploads/corporate-governance/${req.file.filename}`;
                Logger.info(`Updated file for CorporateGovernance ID ${id}: ${updateData.file}`);
                if (oldFile) {
                    await CorporateGovernanceController.deleteFile(oldFile);
                }
            }

            await governance.update(updateData);

            await CacheService.invalidate("corporateGovernance");
            await CacheService.invalidate(`corporateGovernance_${id}`);
            res.json({ success: true, data: governance, message: "Corporate Governance item updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const governance = await CorporateGovernance.findByPk(id);
            if (!governance) {
                throw new CustomError("Corporate Governance item not found", 404);
            }

            const oldFile = governance.file;
            await governance.destroy();

            if (oldFile) {
                await CorporateGovernanceController.deleteFile(oldFile);
            }

            await CacheService.invalidate("corporateGovernance");
            await CacheService.invalidate(`corporateGovernance_${id}`);
            res.json({ success: true, message: "Corporate Governance item deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CorporateGovernanceController;