const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const Directors = models.Directors;

class DirectorsController {
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
      if (req.file) {
        data.image = `/uploads/directors/${req.file.filename}`;
        Logger.info(`Uploaded image for Directors: ${data.image}`);
      }

      const link = await Directors.create(data);
      await CacheService.invalidate("Directors");
      res.status(201).json({ success: true, data: link, message: "Directors data created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Directors";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const teams = await Directors.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(teams), 3600);
        return res.json({ success: true, data: teams });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `Directors_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Directors.findAndCountAll({
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
      const cacheKey = `directors_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const team = await Directors.findByPk(id);
      if (!team) {
        throw new CustomError("Directors data not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(team), 3600);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const team = await Directors.findByPk(id);
      if (!team) {
        throw new CustomError("Directors data not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = team.image;

      if (req.file) {
        updateData.image = `/uploads/directors/${req.file.filename}`;
        Logger.info(`Updated image for Directors ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await DirectorsController.deleteFile(oldImage);
        }
      }

      await team.update(updateData);
      await CacheService.invalidate("Directors");
      await CacheService.invalidate(`directors_${id}`);
      res.json({ success: true, data: team, message: "Directors data updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const team = await Directors.findByPk(id);
      if (!team) {
        throw new CustomError("Directors data not found", 404);
      }

      const oldImage = team.image;
      await team.destroy();

      if (oldImage) {
        await DirectorsController.deleteFile(oldImage);
      }

      await CacheService.invalidate("Directors");
      await CacheService.invalidate(`directors_${id}`);
      res.json({ success: true, message: "Directors data deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DirectorsController;
