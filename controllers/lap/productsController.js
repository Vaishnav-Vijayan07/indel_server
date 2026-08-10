const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LapProducts = models.LapProducts;

class LapProductsController {
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
        updateData.icon = `/uploads/lap-products/${req.file.filename}`;
        Logger.info(`Uploaded icon for LapProduct: ${updateData.icon}`);
      }

      const lapProduct = await LapProducts.create(updateData);

      await CacheService.invalidate("lapProducts");
      await CacheService.invalidatePattern("lapProducts_page_*");
      res.status(201).json({ success: true, data: lapProduct, message: "LAP Product created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "lapProducts";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const lapProducts = await LapProducts.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(lapProducts), 3600);
        return res.json({ success: true, data: lapProducts });
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
      const cacheKey = search ? null : `lapProducts_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {            return res.json(JSON.parse(cachedData));          }
      }

      const { count, rows } = await LapProducts.findAndCountAll({
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

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const lapProduct = await LapProducts.findByPk(id);
      if (!lapProduct) {
        throw new CustomError("LAP Product not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = lapProduct.icon;

      if (req.file) {
        updateData.icon = `/uploads/lap-products/${req.file.filename}`;
        Logger.info(`Updated icon for LapProduct ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await LapProductsController.deleteFile(oldIcon);
        }
      }

      await lapProduct.update(updateData);

      await CacheService.invalidate("lapProducts");
      await CacheService.invalidatePattern("lapProducts_page_*");
      await CacheService.invalidate(`lapProduct_${id}`);
      res.json({ success: true, data: lapProduct, message: "LAP Product updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const lapProduct = await LapProducts.findByPk(id);
      if (!lapProduct) {
        throw new CustomError("LAP Product not found", 404);
      }

      const oldIcon = lapProduct.icon;
      await lapProduct.destroy();

      if (oldIcon) {
        await LapProductsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("lapProducts");
      await CacheService.invalidatePattern("lapProducts_page_*");
      await CacheService.invalidate(`lapProduct_${id}`);
      res.json({ success: true, message: "LAP Product deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LapProductsController;
