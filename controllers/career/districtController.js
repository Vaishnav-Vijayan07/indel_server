const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Districts = models.Districts;

class DistrictsController {
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
                updateData.image = `/uploads/career-districts/${req.file.filename}`;
                Logger.info(`Uploaded image for District: ${updateData.image}`);
            }

            const district = await Districts.create(updateData);

            await CacheService.invalidate("districts");
            await CacheService.invalidate("webCareerPage");

            res.status(201).json({ success: true, data: district, message: "District created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const cacheKey = "districts";
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const districts = await Districts.findAll({
                order: [["order", "ASC"]],
                include: [{ model: models.CareerStates, as: "state" }] // Assuming association
            });

            await CacheService.set(cacheKey, JSON.stringify(districts), 3600);
            res.json({ success: true, data: districts });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const cacheKey = `district_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const district = await Districts.findByPk(id, {
                include: [{ model: models.CareerStates, as: "state" }] // Assuming association
            });
            if (!district) {
                throw new CustomError("District not found", 404);
            }

            await CacheService.set(cacheKey, JSON.stringify(district), 3600);
            res.json({ success: true, data: district });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const district = await Districts.findByPk(id);
            if (!district) {
                throw new CustomError("District not found", 404);
            }

            const updateData = { ...req.body };
            let oldImage = district.image;

            if (req.file) {
                updateData.image = `/uploads/career-districts/${req.file.filename}`;
                Logger.info(`Updated image for District ID ${id}: ${updateData.image}`);
                if (oldImage) {
                    await DistrictsController.deleteFile(oldImage);
                }
            }

            await district.update(updateData);

            await CacheService.invalidate("districts");
            await CacheService.invalidate("webCareerPage");
            await CacheService.invalidate(`district_${id}`);
            res.json({ success: true, data: district, message: "District updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const district = await Districts.findByPk(id);
            if (!district) {
                throw new CustomError("District not found", 404);
            }

            const oldImage = district.image;
            await district.destroy();

            if (oldImage) {
                await DistrictsController.deleteFile(oldImage);
            }

            await CacheService.invalidate("districts");
            await CacheService.invalidate("webCareerPage");
            await CacheService.invalidate(`district_${id}`);
            res.json({ success: true, message: "District deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DistrictsController;
