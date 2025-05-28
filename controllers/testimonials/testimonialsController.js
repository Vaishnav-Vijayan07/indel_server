const { models } = require("../../models/index");
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
      }

      const testimonial = await Testimonials.create(data);
      await CacheService.invalidate("Testimonials");
      res.status(201).json({ success: true, data: testimonial, message: "Testimonial created" });
    } catch (error) {
      if (req.files) {
        if (req.files.avatar)
          await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.avatar[0].filename}`);
        if (req.files.video)
          await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.video[0].filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "Testimonials";
      // const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const testimonials = await Testimonials.findAll({
        // where: { is_active: true },
        order: [[Testimonials.sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
      });

      console.log(testimonials);

      await CacheService.set(cacheKey, JSON.stringify(testimonials), 3600);
      res.json({ success: true, data: testimonials });
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
      }

      await testimonial.update(updateData);
      await CacheService.invalidate("Testimonials");
      await CacheService.invalidate(`testimonial_${id}`);
      res.json({ success: true, data: testimonial, message: "Testimonial updated" });
    } catch (error) {
      if (req.files) {
        if (req.files.avatar)
          await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.avatar[0].filename}`);
        if (req.files.video)
          await TestimonialsController.deleteFile(`/uploads/investors/testimonials/${req.files.video[0].filename}`);
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
      await testimonial.destroy();

      if (oldAvatar) await TestimonialsController.deleteFile(oldAvatar);
      if (oldVideo) await TestimonialsController.deleteFile(oldVideo);

      await CacheService.invalidate("Testimonials");
      await CacheService.invalidate(`testimonial_${id}`);
      res.json({ success: true, message: "Testimonial deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TestimonialsController;
