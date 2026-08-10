const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("../../utils/slugify");
const { Op } = require("sequelize");

const IndelCares = models.IndelCares;

class IndelCaresController {
  static async generateUniqueSlug(title, excludeId = null) {
    let slug = slugify(title);
    if (!slug) {
      slug = "blog-post"; // Fallback slug if title is empty
    }

    let count = 0;
    let uniqueSlug = slug;

    // Check for existing slugs
    while (
      await IndelCares.findOne({
        where: { slug: uniqueSlug, id: { [Op.ne]: excludeId } },
      })
    ) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }

    return uniqueSlug;
  }

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

      if (!updateData.slug && updateData.title) {
        updateData.slug = await IndelCaresController.generateUniqueSlug(updateData.title);
        Logger.info(`Generated slug for new IndelCares: ${updateData.slug}`);
      }

      if (req.file) {
        updateData.image = `/uploads/indel-cares/${req.file.filename}`;
        Logger.info(`Uploaded image for IndelCares: ${updateData.image}`);
      }

      const indelCare = await IndelCares.create(updateData);

      await CacheService.invalidate("indelCares");
      await CacheService.invalidate("webIndelCares");
      await CacheService.invalidatePattern("indelCares_page_*");
      res.status(201).json({ success: true, data: indelCare, message: "Indel Cares item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "indelCares";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const indelCares = await IndelCares.findAll({
          order: [["order", "ASC"], ["created_at", "DESC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(indelCares), 3600);
        return res.json({ success: true, data: indelCares });
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
      const cacheKey = search ? null : `indelCares_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await IndelCares.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"], ["created_at", "DESC"]],
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
      const cacheKey = `indelCare_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const indelCare = await IndelCares.findByPk(id);
      if (!indelCare) {
        throw new CustomError("Indel Cares item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(indelCare), 3600);
      res.json({ success: true, data: indelCare });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const indelCare = await IndelCares.findByPk(id);
      if (!indelCare) {
        throw new CustomError("Indel Cares item not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = indelCare.image;

      if (!updateData.slug) {
        updateData.slug = await IndelCaresController.generateUniqueSlug(updateData.title, id);
        Logger.info(`Generated slug for updated IndelCares ID ${id}: ${updateData.slug}`);
      }

      if (req.file) {
        updateData.image = `/uploads/indel-cares/${req.file.filename}`;
        Logger.info(`Updated image for IndelCares ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await IndelCaresController.deleteFile(oldImage);
        }
      }

      await indelCare.update(updateData);

      await CacheService.invalidate("indelCares");
      await CacheService.invalidate("webIndelCares");
      await CacheService.invalidate(`indelCare_${id}`);
      await CacheService.invalidatePattern("indelCares_page_*");
      res.json({ success: true, data: indelCare, message: "Indel Cares item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const indelCare = await IndelCares.findByPk(id);
      if (!indelCare) {
        throw new CustomError("Indel Cares item not found", 404);
      }

      const oldImage = indelCare.image;
      await indelCare.destroy();

      if (oldImage) {
        await IndelCaresController.deleteFile(oldImage);
      }

      await CacheService.invalidate("indelCares");
      await CacheService.invalidate("webIndelCares");
      await CacheService.invalidate(`indelCare_${id}`);
      await CacheService.invalidatePattern("indelCares_page_*");
      res.json({ success: true, message: "Indel Cares item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IndelCaresController;
