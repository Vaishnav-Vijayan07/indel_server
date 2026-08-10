const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const SocialMediaIcons = models.SocialMediaIcons;

class SocialMediaIconsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted icon: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete icon ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.icon = `/uploads/social-media-icons/${req.file.filename}`;
        Logger.info(`Uploaded icon for SocialMediaIcon: ${updateData.icon}`);
      }

      const socialMediaIcon = await SocialMediaIcons.create(updateData);

      await CacheService.invalidate("socialMediaIcons");
      await CacheService.invalidatePattern("socialMediaIcons_page_*");
      res.status(201).json({ success: true, data: socialMediaIcon, message: "Social Media Icon created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "socialMediaIcons";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const socialMediaIcons = await SocialMediaIcons.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(socialMediaIcons), 3600);
        return res.json({ success: true, data: socialMediaIcons });
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
      const cacheKey = search ? null : `socialMediaIcons_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await SocialMediaIcons.findAndCountAll({
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
      const cacheKey = `socialMediaIcon_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(socialMediaIcon), 3600);
      res.json({ success: true, data: socialMediaIcon });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      const updateData = { ...req.body };
      let oldFile = socialMediaIcon.icon;

      if (req.file) {
        updateData.icon = `/uploads/social-media-icons/${req.file.filename}`;
        Logger.info(`Updated icon for SocialMediaIcon ID ${id}: ${updateData.icon}`);
        if (oldFile) {
          await SocialMediaIconsController.deleteFile(oldFile);
        }
      }

      await socialMediaIcon.update(updateData);

      await CacheService.invalidate("socialMediaIcons");
      await CacheService.invalidate(`socialMediaIcon_${id}`);
      await CacheService.invalidatePattern("socialMediaIcons_page_*");
      res.json({ success: true, data: socialMediaIcon, message: "Social Media Icon updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      const oldFile = socialMediaIcon.icon;
      await socialMediaIcon.destroy();

      if (oldFile) {
        await SocialMediaIconsController.deleteFile(oldFile);
      }

      await CacheService.invalidate("socialMediaIcons");
      await CacheService.invalidate(`socialMediaIcon_${id}`);
      await CacheService.invalidatePattern("socialMediaIcons_page_*");
      res.json({ success: true, message: "Social Media Icon deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SocialMediaIconsController;
