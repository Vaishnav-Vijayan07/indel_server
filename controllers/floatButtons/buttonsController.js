const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const FloatButtons = models.FloatButtons;

class FloatButtonsController {
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
        updateData.icon = `/uploads/float-buttons/${req.file.filename}`;
        Logger.info(`Uploaded icon for FloatButton: ${updateData.icon}`);
      }

      const floatButton = await FloatButtons.create(updateData);

      await CacheService.invalidate("floatButtons");
      await CacheService.invalidate("webFloatButton");
      res.status(201).json({ success: true, data: floatButton, message: "Float Button created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "floatButtons";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const floatButtons = await FloatButtons.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(floatButtons), 3600);
        return res.json({ success: true, data: floatButtons });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.link = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `floatButtons_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await FloatButtons.findAndCountAll({
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
      const cacheKey = `floatButton_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(floatButton), 3600);
      res.json({ success: true, data: floatButton });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = floatButton.icon;

      if (req.file) {
        updateData.icon = `/uploads/float-buttons/${req.file.filename}`;
        Logger.info(`Updated icon for FloatButton ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await FloatButtonsController.deleteFile(oldIcon);
        }
      }

      await floatButton.update(updateData);

      await CacheService.invalidate("floatButtons");
      await CacheService.invalidate(`floatButton_${id}`);
      await CacheService.invalidate("webFloatButton");
      res.json({ success: true, data: floatButton, message: "Float Button updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      const oldIcon = floatButton.icon;
      await floatButton.destroy();

      if (oldIcon) {
        await FloatButtonsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("floatButtons");
      await CacheService.invalidate(`floatButton_${id}`);
      await CacheService.invalidate("webFloatButton");
      res.json({ success: true, message: "Float Button deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FloatButtonsController;
