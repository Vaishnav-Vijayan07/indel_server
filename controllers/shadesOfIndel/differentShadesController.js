const { models } = require("../../models");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const DifferentShades = models.DifferentShades;

class DifferentShadesController {
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

      if (req.files?.banner_image) {
        data.banner_image = `/uploads/different-shades/${req.files.banner_image[0]?.filename}`;
      }

      if (req.files?.brand_icon) {
        data.brand_icon = `/uploads/different-shades/${req.files.brand_icon[0]?.filename}`;
      }

      if (req.files?.image) {
        data.image = `/uploads/different-shades/${req.files.image[0]?.filename}`;
      }

      if (req.files?.second_image) {
        data.second_image = `/uploads/different-shades/${req.files.second_image[0]?.filename}`;
      }

      if (req.files?.mobile_icon) {
        data.mobile_icon = `/uploads/different-shades/${req.files.mobile_icon[0]?.filename}`;
      }

      const item = await DifferentShades.create(data);
      await CacheService.invalidate("differentShades");
      await CacheService.invalidate("webShadesOfIndel");
      res.status(201).json({ success: true, data: item, message: "Item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "differentShades";
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          return res.json({ success: true, data: JSON.parse(cached) });
        }

        const items = await DifferentShades.findAll({ order: [["sort_order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(items), 3600);
        return res.json({ success: true, data: items });
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
      const cacheKey = search ? null : `differentShades_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      }

      const { count, rows } = await DifferentShades.findAndCountAll({
        where: whereConditions,
        order: [["sort_order", "ASC"]],
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
      const cacheKey = `differentShades_${id}`;
      const cached = await CacheService.get(cacheKey);

      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached) });
      }

      const item = await DifferentShades.findByPk(id);
      if (!item) {
        throw new CustomError("Item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(item), 3600);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await DifferentShades.findByPk(id);
      if (!item) {
        throw new CustomError("Item not found", 404);
      }

      const updateData = { ...req.body };

      if (req.files?.banner_image) {
        updateData.banner_image = `/uploads/different-shades/${req.files.banner_image[0].filename}`;
        await DifferentShadesController.deleteFile(item.banner_image);
      }

      if (req.files?.brand_icon) {
        updateData.brand_icon = `/uploads/different-shades/${req.files.brand_icon[0].filename}`;
        await DifferentShadesController.deleteFile(item.brand_icon);
      }

      if (req.files?.image) {
        updateData.image = `/uploads/different-shades/${req.files.image[0].filename}`;
        await DifferentShadesController.deleteFile(item.image);
      }

      if (req.files?.second_image) {
        updateData.second_image = `/uploads/different-shades/${req.files.second_image[0].filename}`;
        await DifferentShadesController.deleteFile(item.second_image);
      }

      if (req.files?.mobile_icon) {
        updateData.mobile_icon = `/uploads/different-shades/${req.files.mobile_icon[0].filename}`;
        await DifferentShadesController.deleteFile(item.mobile_icon);
      }

      await item.update(updateData);
      await CacheService.invalidate("differentShades");
      await CacheService.invalidate(`differentShades_${id}`);
      await CacheService.invalidate("webShadesOfIndel");

      res.json({ success: true, data: item, message: "Item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const item = await DifferentShades.findByPk(id);
      if (!item) {
        throw new CustomError("Item not found", 404);
      }

      const oldBannerImage = item.banner_image;
      const oldBrandIcon = item.brand_icon;
      const oldImage = item.image;
      const oldSecondImage = item.second_image;

      await item.destroy();

      await DifferentShadesController.deleteFile(oldBannerImage);
      await DifferentShadesController.deleteFile(oldBrandIcon);
      await DifferentShadesController.deleteFile(oldImage);
      await DifferentShadesController.deleteFile(oldSecondImage);

      await CacheService.invalidate("differentShades");
      await CacheService.invalidate(`differentShades_${id}`);
      res.json({ success: true, message: "Item deleted", data: id });
      await CacheService.invalidate("webShadesOfIndel");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DifferentShadesController;
