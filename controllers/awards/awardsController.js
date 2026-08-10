const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Awards = models.Awards;

class AwardsController {
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
        throw new CustomError("Image is required", 400);
      }
      data.image = `/uploads/awards/${req.file.filename}`;
      Logger.info(`Uploaded image for Awards: ${data.image}`);

      const award = await Awards.create(data);
      await CacheService.invalidate("Awards");
      await CacheService.invalidate("webAwards");
      res.status(201).json({ success: true, data: award, message: "Award created" });
    } catch (error) {
      if (req.file) {
        await AwardsController.deleteFile(`/uploads/awards/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Awards";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const awards = await Awards.findAll({ order: [["year", "DESC"]] });
        await CacheService.set(cacheKey, JSON.stringify(awards), 3600);
        return res.json({ success: true, data: awards });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `Awards_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        // if (cachedData) {
          // return res.json(JSON.parse(cachedData));
        // }
      }

      const { count, rows } = await Awards.findAndCountAll({
        where: whereConditions,
        order: [["year", "DESC"]],
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
      const cacheKey = `award_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const award = await Awards.findByPk(id);
      if (!award) {
        throw new CustomError("Award not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(award), 3600);
      res.json({ success: true, data: award });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const award = await Awards.findByPk(id);
      if (!award) {
        throw new CustomError("Award not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = award.image;

      if (req.file) {
        updateData.image = `/uploads/awards/${req.file.filename}`;
        Logger.info(`Updated image for Award ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await AwardsController.deleteFile(oldImage);
        }
      }

      await award.update(updateData);
      await CacheService.invalidate("Awards");
      await CacheService.invalidate("webAwards");
      await CacheService.invalidate(`award_${id}`);
      res.json({ success: true, data: award, message: "Award updated" });
    } catch (error) {
      if (req.file) {
        await AwardsController.deleteFile(`/uploads/awards/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const award = await Awards.findByPk(id);
      if (!award) {
        throw new CustomError("Award not found", 404);
      }

      const oldImage = award.image;
      await award.destroy();

      if (oldImage) {
        await AwardsController.deleteFile(oldImage);
      }

      await CacheService.invalidate("Awards");
      await CacheService.invalidate("webAwards");
      await CacheService.invalidate(`award_${id}`);
      res.json({ success: true, message: "Award deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AwardsController;