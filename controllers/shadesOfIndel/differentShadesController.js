const { models } = require("../../models");
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
      const cacheKey = "differentShades";
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached) });
      }

      const items = await DifferentShades.findAll({ order: [["sort_order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(items), 3600);
      res.json({ success: true, data: items });
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

      await item.destroy();

      await DifferentShadesController.deleteFile(item.banner_image);
      await DifferentShadesController.deleteFile(item.brand_icon);
      await DifferentShadesController.deleteFile(item.image);
      await DifferentShadesController.deleteFile(item.second_image);

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
