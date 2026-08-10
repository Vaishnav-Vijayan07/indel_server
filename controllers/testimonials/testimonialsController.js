const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Testimonials = models.Testimonials;

class TestimonialsController {
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
      if (req.files) {
        if (req.files.avatar) {
          data.avatar = `/uploads/investors/testimonials/${req.files.avatar[0].filename}`;
          Logger.info(`Uploaded avatar: ${data.avatar}`);
        }
        if (req.files.video) {
          data.video = `/uploads/investors/testimonials/${req.files.video[0].filename}`;
          Logger.info(`Uploaded video: ${data.video}`);
        }
        if (req.files.thumbnail) {
          data.thumbnail = `/uploads/investors/testimonials/${req.files.thumbnail[0].filename}`;
          Logger.info(`Uploaded thumbnail: ${data.thumbnail}`);
        }
      }

      const testimonial = await Testimonials.create(data);
      await CacheService.invalidate("Testimonials");
      await CacheService.invalidatePattern("Testimonials_page_*");
      res.status(201).json({ success: true, data: testimonial, message: "Testimonial created" });
    } catch (error) {
      if (req.files) {
        if (req.files.avatar) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.avatar[0].filename}`);
        if (req.files.video) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.video[0].filename}`);
        if (req.files.thumbnail) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.thumbnail[0].filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Testimonials";

        const testimonials = await Testimonials.findAll({
          order: [[Testimonials.sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(testimonials), 3600);
        return res.json({ success: true, data: testimonials });
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
      const cacheKey = search ? null : `Testimonials_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Testimonials.findAndCountAll({
        where: whereConditions,
        order: [[Testimonials.sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
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
      const cacheKey = `testimonial_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const testimonial = await Testimonials.findByPk(id);
      if (!testimonial) {
        throw new CustomError("Testimonial not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(testimonial), 3600);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const testimonial = await Testimonials.findByPk(id);
      if (!testimonial) {
        throw new CustomError("Testimonial not found", 404);
      }

      const updateData = { ...req.body };

      

      const oldAvatar = testimonial.avatar;
      const oldVideo = testimonial.video;
      const oldThumbnail = testimonial.thumbnail;

      if (req.files) {
        if (req.files.avatar) {
          updateData.avatar = `/uploads/investors/testimonials/${req.files.avatar[0].filename}`;
          Logger.info(`Updated avatar for testimonial ID ${id}: ${updateData.avatar}`);
          if (oldAvatar) await TestimonialsController.deleteFile(oldAvatar);
        }
        if (req.files.video) {
          updateData.video = `/uploads/investors/testimonials/${req.files.video[0].filename}`;
          Logger.info(`Updated video for testimonial ID ${id}: ${updateData.video}`);
          if (oldVideo) await TestimonialsController.deleteFile(oldVideo);
        }
        if (req.files.thumbnail) {
          updateData.thumbnail = `/uploads/investors/testimonials/${req.files.thumbnail[0].filename}`;
          Logger.info(`Updated thumbnail for testimonial ID ${id}: ${updateData.thumbnail}`);
          if (oldThumbnail) await TestimonialsController.deleteFile(oldThumbnail);
        }
      }

      await testimonial.update(updateData);
      await CacheService.invalidate("Testimonials");
      await CacheService.invalidate(`testimonial_${id}`);
      await CacheService.invalidatePattern("Testimonials_page_*");
      res.json({ success: true, data: testimonial, message: "Testimonial updated" });
    } catch (error) {
      if (req.files) {
        if (req.files.avatar) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.avatar[0].filename}`);
        if (req.files.video) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.video[0].filename}`);
        if (req.files.thumbnail) await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.thumbnail[0].filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const testimonial = await Testimonials.findByPk(id);
      if (!testimonial) {
        throw new CustomError("Testimonial not found", 404);
      }

      const oldAvatar = testimonial.avatar;
      const oldVideo = testimonial.video;
      const oldThumbnail = testimonial.thumbnail;
      await testimonial.destroy();

      if (oldAvatar) await TestimonialsController.deleteFile(oldAvatar);
      if (oldVideo) await TestimonialsController.deleteFile(oldVideo);
      if (oldThumbnail) await TestimonialsController.deleteFile(oldThumbnail);

      await CacheService.invalidate("Testimonials");
      await CacheService.invalidate(`testimonial_${id}`);
      await CacheService.invalidatePattern("Testimonials_page_*");
      res.json({ success: true, message: "Testimonial deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TestimonialsController;
