const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const EventGallery = models.EventGallery;

class EventGalleryController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        filePath.replace("/uploads/", "")
      );
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
        if (req.files.image) {
          data.image = `/uploads/event-gallery/${req.files.image[0].filename}`;
          Logger.info(`Uploaded image: ${data.image}`);
        }
        if (req.files.video) {
          data.video = `/uploads/event-gallery/${req.files.video[0].filename}`;
          Logger.info(`Uploaded video: ${data.video}`);
        }
      }

      const eventGallery = await EventGallery.create(data);
      await CacheService.invalidate("EventGallery");
      await CacheService.invalidate("webEventGallery");
      res.status(201).json({
        success: true,
        data: eventGallery,
        message: "Event Gallery item created",
      });
    } catch (error) {
      if (req.file) {
        await EventGalleryController.deleteFile(
          `/uploads/event-gallery/${req.file.filename}`
        );
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "EventGallery";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const galleryItems = await EventGallery.findAll({
        order: [["order", "ASC"]],
        include: [{ model: models.EventTypes, as: "eventType" }],
      });
      await CacheService.set(cacheKey, JSON.stringify(galleryItems), 3600);
      res.json({ success: true, data: galleryItems });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `eventGallery_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const eventGallery = await EventGallery.findByPk(id, {
        include: [{ model: models.EventTypes, as: "eventType" }],
      });
      if (!eventGallery) {
        throw new CustomError("Event Gallery item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(eventGallery), 3600);
      res.json({ success: true, data: eventGallery });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const eventGallery = await EventGallery.findByPk(id);
      if (!eventGallery) {
        throw new CustomError("Event Gallery item not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = eventGallery.image;
      const oldVideo = eventGallery.video;
      const oldVideoThumbnail = eventGallery.video_thumbnail;

      if (req.files) {
        if (req.files.image) {
          updateData.image = `/uploads/event-gallery/${req.files.image[0].filename}`;
          Logger.info(
            `Updated image for testimonial ID ${id}: ${updateData.image}`
          );
          if (oldImage) await EventGalleryController.deleteFile(oldImage);
        }
        if (req.files.video) {
          updateData.video = `/uploads/event-gallery/${req.files.video[0].filename}`;
          Logger.info(
            `Updated video for testimonial ID ${id}: ${updateData.video}`
          );
          if (oldVideo) await EventGalleryController.deleteFile(oldVideo);
        }
        if (req.files.video_thumbnail) {
          updateData.video_thumbnail = `/uploads/event-gallery/${req.files.video_thumbnail[0].filename}`;
          Logger.info(
            `Updated video_thumbnail for testimonial ID ${id}: ${updateData.video_thumbnail}`
          );
          if (oldVideoThumbnail)
            await EventGalleryController.deleteFile(oldVideoThumbnail);
        }
      }

      await eventGallery.update(updateData);
      await CacheService.invalidate("EventGallery");
      await CacheService.invalidate("webEventGallery");
      await CacheService.invalidate(`eventGallery_${id}`);
      res.json({
        success: true,
        data: eventGallery,
        message: "Event Gallery item updated",
      });
    } catch (error) {
      if (req.file) {
        await EventGalleryController.deleteFile(
          `/uploads/event-gallery/${req.file.filename}`
        );
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const eventGallery = await EventGallery.findByPk(id);
      if (!eventGallery) {
        throw new CustomError("Event Gallery item not found", 404);
      }

      const oldImage = eventGallery.image;
      await eventGallery.destroy();

      if (oldImage) {
        await EventGalleryController.deleteFile(oldImage);
      }

      await CacheService.invalidate("EventGallery");
      await CacheService.invalidate("webEventGallery");
      await CacheService.invalidate(`eventGallery_${id}`);
      res.json({
        success: true,
        message: "Event Gallery item deleted",
        data: id,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EventGalleryController;
