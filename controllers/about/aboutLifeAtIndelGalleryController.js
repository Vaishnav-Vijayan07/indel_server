const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutLifeAtIndelGallery = models.AboutLifeAtIndelGallery;

class AboutLifeAtIndelGalleryController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..","..", "uploads", filePath.replace("/uploads/", ""));
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
        data.image = `/uploads/about-life-at-indel-gallery/${req.file.filename}`;
        Logger.info(`Uploaded image for AboutLifeAtIndelGallery: ${data.image}`);
      }

      const galleryItem = await AboutLifeAtIndelGallery.create(data);

      await CacheService.invalidate("aboutLifeAtIndelGallery");
      res.status(201).json({ success: true, data: galleryItem, message: "Gallery item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "aboutLifeAtIndelGallery";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const items = await AboutLifeAtIndelGallery.findAll({ order: [["order", "ASC"]] });
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
        whereConditions.image_alt = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `aboutLifeAtIndelGallery_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        // if (cachedData) {
          // return res.json(JSON.parse(cachedData));
        // }
      }

      const { count, rows } = await AboutLifeAtIndelGallery.findAndCountAll({
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
      const cacheKey = `aboutLifeAtIndelGallery_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const item = await AboutLifeAtIndelGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
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
      const item = await AboutLifeAtIndelGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
      }

      const data = { ...req.body };
      const oldImage = item.image;

      if (req.file) {
        data.image = `/uploads/about-life-at-indel-gallery/${req.file.filename}`;
        Logger.info(`Updated image for AboutLifeAtIndelGallery ID ${id}: ${data.image}`);
        // if (oldImage) {
        //   await AboutLifeAtIndelGalleryController.deleteFile(oldImage);
        // }
      }

      await item.update(data);

      await CacheService.invalidate("aboutLifeAtIndelGallery");
      await CacheService.invalidate(`aboutLifeAtIndelGallery_${id}`);
      res.json({ success: true, data: item, message: "Gallery item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const item = await AboutLifeAtIndelGallery.findByPk(id);
      if (!item) {
        throw new CustomError("Gallery item not found", 404);
      }

      const oldImage = item.image;
      await item.destroy();

      // if (oldImage) {
      //   await AboutLifeAtIndelGalleryController.deleteFile(oldImage);
      // }

      await CacheService.invalidate("aboutLifeAtIndelGallery");
      await CacheService.invalidate(`aboutLifeAtIndelGallery_${id}`);
      res.json({ success: true, message: "Gallery item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutLifeAtIndelGalleryController;
