const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const HistoryImages = models.HistoryImages;

class HistoryImagesController {
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
        updateData.image = `/uploads/history-images/${req.file.filename}`;
        Logger.info(`Uploaded icon for HistoryImages: ${updateData.image}`);
      }

      const step = await HistoryImages.create(updateData);

      await CacheService.invalidate("HistoryImages");
      res.status(201).json({ success: true, data: step,message:"History image created" });
      await CacheService.invalidate("webHistoryData");
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "HistoryImages";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const steps = await HistoryImages.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(steps), 3600);
        return res.json({ success: true, data: steps });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.image_alt = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `HistoryImages_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await HistoryImages.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
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
      const cacheKey = `HistoryImages_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const step = await HistoryImages.findByPk(id);
      if (!step) {
        throw new CustomError("History image not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(step), 3600);
      res.json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HistoryImages.findByPk(id);
      if (!step) {
        throw new CustomError("History image not found", 404);
      }

      const updateData = { ...req.body };
      let oldIconUrl = step.image;

      if (req.file) {
        updateData.image = `/uploads/history-images/${req.file.filename}`;
        Logger.info(`Updated icon for HistoryImages ID ${id}: ${updateData.image}`);
        if (oldIconUrl) {
          await HistoryImagesController.deleteFile(oldIconUrl);
        }
      }

      await step.update(updateData);

      await CacheService.invalidate("HistoryImages");
      await CacheService.invalidate(`HistoryImages_${id}`);
      await CacheService.invalidate("webHistoryData");

      res.json({ success: true, data: step,message:"History image updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HistoryImages.findByPk(id);
      if (!step) {
        throw new CustomError("History image not found", 404);
      }

      const oldIconUrl = step.image;
      await step.destroy();

      if (oldIconUrl) {
        await HistoryImagesController.deleteFile(oldIconUrl);
      }

      await CacheService.invalidate("HistoryImages");
      await CacheService.invalidate(`HistoryImages_${id}`);
      res.json({ success: true, message: "History image deleted", data: id });
      await CacheService.invalidate("webHistoryData");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HistoryImagesController;
