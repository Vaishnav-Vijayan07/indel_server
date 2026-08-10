const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CreditRatings = models.CreditRatings;

class CreditRatingsController {
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
                updateData.file = `/uploads/credit-ratings/${req.file.filename}`;
                Logger.info(`Uploaded file for CreditRating: ${updateData.file}`);
            }

            const rating = await CreditRatings.create(updateData);

            await CacheService.invalidate("creditRatings");
            await CacheService.invalidate("webCreditRatings");
            res.status(201).json({ success: true, data: rating, message: "Credit Rating created" });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const { page, limit, search } = req.query;

            // Legacy path (no pagination params) — backward compatible
            if (!page && !limit) {
                const cacheKey = "creditRatings";
                const cachedData = await CacheService.get(cacheKey);

                if (cachedData) {
                    return res.json({ success: true, data: JSON.parse(cachedData) });
                }

                const ratings = await CreditRatings.findAll({
                    order: [["order", "ASC"]],
                });

                await CacheService.set(cacheKey, JSON.stringify(ratings), 3600);
                return res.json({ success: true, data: ratings });
            }

            // Pagination path
            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
            const offset = (pageNum - 1) * limitNum;

            const whereConditions = {};
            if (search && search.trim()) {
                whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
            }

            const cacheKey = search ? null : `creditRatings_page_${pageNum}_limit_${limitNum}`;

            const { count, rows } = await CreditRatings.findAndCountAll({
                where: whereConditions,
                order: [["order", "ASC"]],
                limit: limitNum,
                offset,
            });

            const totalPages = Math.ceil(count / limitNum);
            const response = {
                success: true,
                data: rows,
                total: count,
                pagination: {
                    page: pageNum,
                    total: count,
                    totalPages,
                    limit: limitNum,
                    offset,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1,
                },
            };

            if (cacheKey) {
                await CacheService.set(cacheKey, JSON.stringify(response), 3600);
            }

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const cacheKey = `creditRating_${id}`;
            const cachedData = await CacheService.get(cacheKey);

            if (cachedData) {
                return res.json({ success: true, data: JSON.parse(cachedData) });
            }

            const rating = await CreditRatings.findByPk(id);
            if (!rating) {
                throw new CustomError("Credit Rating not found", 404);
            }

            await CacheService.set(cacheKey, JSON.stringify(rating), 3600);
            res.json({ success: true, data: rating });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const rating = await CreditRatings.findByPk(id);
            if (!rating) {
                throw new CustomError("Credit Rating not found", 404);
            }

            const updateData = { ...req.body };
            let oldFile = rating.file;

            if (req.file) {
                updateData.file = `/uploads/credit-ratings/${req.file.filename}`;
                Logger.info(`Updated file for CreditRating ID ${id}: ${updateData.file}`);
                if (oldFile) {
                    await CreditRatingsController.deleteFile(oldFile);
                }
            }

            await rating.update(updateData);

            await CacheService.invalidate("creditRatings");
            await CacheService.invalidate("webCreditRatings");
            await CacheService.invalidate(`creditRating_${id}`);
            res.json({ success: true, data: rating, message: "Credit Rating updated" });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const rating = await CreditRatings.findByPk(id);
            if (!rating) {
                throw new CustomError("Credit Rating not found", 404);
            }

            const oldFile = rating.file;
            await rating.destroy();

            if (oldFile) {
                await CreditRatingsController.deleteFile(oldFile);
            }

            await CacheService.invalidate("creditRatings");
            await CacheService.invalidate("webCreditRatings");
            await CacheService.invalidate(`creditRating_${id}`);
            res.json({ success: true, message: "Credit Rating deleted", data: id });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CreditRatingsController;