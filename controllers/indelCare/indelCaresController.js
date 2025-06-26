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
      res.status(201).json({ success: true, data: indelCare, message: "Indel Cares item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "indelCares";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const indelCares = await IndelCares.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(indelCares), 3600);
      res.json({ success: true, data: indelCares });
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

      if (updateData.title && !updateData.slug) {
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
      res.json({ success: true, message: "Indel Cares item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IndelCaresController;
