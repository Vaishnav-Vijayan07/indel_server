const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Partners = models.Partners;

class PartnersController {
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
        updateData.logo = `/uploads/partners/${req.file.filename}`;
        Logger.info(`Uploaded image for Partners: ${updateData.logo}`);
      }

      const partners = await Partners.create(updateData);

      await CacheService.invalidate("Partners");
      await CacheService.invalidatePattern("Partners_page_*");
      res.status(201).json({ success: true, data: partners, message: "Partners created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Partners";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const partners = await Partners.findAll({
          order: [["order", "ASC"]],
          include: [{ model: models.PartnersTypes, as: "partnerType" }],
        });

        await CacheService.set(cacheKey, JSON.stringify(partners), 3600);
        return res.json({ success: true, data: partners });
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
      const cacheKey = search ? null : `Partners_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          // return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Partners.findAndCountAll({
        where: whereConditions,
        include: [{ model: models.PartnersTypes, as: "partnerType" }],
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
        distinct: true,
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
      const cacheKey = `partners_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(partners), 3600);
      res.json({ success: true, data: partners });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = partners.logo;

      if (req.file) {
        updateData.logo = `/uploads/partners/${req.file.filename}`;
        Logger.info(`Updated logo for Partners ID ${id}: ${updateData.logo}`);
        if (oldImage) {
          await PartnersController.deleteFile(oldImage);
        }
      }

      await partners.update(updateData);

      await CacheService.invalidate("Partners");
      await CacheService.invalidate(`partners_${id}`);
      await CacheService.invalidatePattern("Partners_page_*");
      res.json({ success: true, data: partners, message: "Partners updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      const oldImage = partners.logo;
      await partners.destroy();

      if (oldImage) {
        await PartnersController.deleteFile(oldImage);
      }

      await CacheService.invalidate("Partners");
      await CacheService.invalidate(`partners_${id}`);
      await CacheService.invalidatePattern("Partners_page_*");
      res.json({ success: true, message: "Partners deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PartnersController;
