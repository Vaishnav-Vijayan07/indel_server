const { Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CareerBanners = models.CareerBanners;

class CareerBannersController {
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
      if (req.files?.image) {
        updateData.image = `/uploads/career-banners/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for CareerBanner: ${updateData.image}`);
      }

      if (req.files?.image_mobile) {
        updateData.image_mobile = `/uploads/career-banners/${req.files.image_mobile[0].filename}`;
        Logger.info(`Uploaded mobile image for CareerBanner: ${updateData.image_mobile}`);
      }

      const banner = await CareerBanners.create(updateData);

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      res.status(201).json({ success: true, data: banner, message: "Career Banner created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "careerBanners";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const banners = await CareerBanners.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(banners), 3600);
        return res.json({ success: true, data: banners });
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
      const cacheKey = search ? null : `careerBanners_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await CareerBanners.findAndCountAll({
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
      const cacheKey = `careerBanner_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(banner), 3600);
      res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = banner.image;
      let oldImageMobile = banner.image_mobile;

      if (req.files?.image) {
        updateData.image = `/uploads/career-banners/${req.files.image[0].filename}`;
        Logger.info(`Updated image for CareerBanner ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await CareerBannersController.deleteFile(oldImage);
        }
      }

      if (req.files?.image_mobile) {
        updateData.image_mobile = `/uploads/career-banners/${req.files.image_mobile[0].filename}`;
        Logger.info(`Updated mobile image for CareerBanner ID ${id}: ${updateData.image_mobile}`);
        if (oldImageMobile) {
          await CareerBannersController.deleteFile(oldImageMobile);
        }
      }

      await banner.update(updateData);

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerBanner_${id}`);
      res.json({ success: true, data: banner, message: "Career Banner updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await CareerBanners.findByPk(id);
      if (!banner) {
        throw new CustomError("Career Banner not found", 404);
      }

      const oldImage = banner.image;
      await banner.destroy();

      if (oldImage) {
        await CareerBannersController.deleteFile(oldImage);
      }

      await CacheService.invalidate("careerBanners");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`careerBanner_${id}`);
      res.json({ success: true, message: "Career Banner deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CareerBannersController;
