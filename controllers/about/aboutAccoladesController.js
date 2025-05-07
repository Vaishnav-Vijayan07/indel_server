const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutAccolades = models.AboutAccolades;

class AboutAccoladesController {
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

      console.log(req.files);

      if (req.files?.highlight_image) {
        data.highlight_image = `/uploads/about-accolades/${req.files.highlight_image[0]?.filename}`;
        Logger.info(`Uploaded image for about accolades highlight image: ${data.highlight_image}`);
      }

      if (req.files?.image) {
        data.image = `/uploads/about-accolades/${req.files.image[0]?.filename}`;
        Logger.info(`Uploaded image for about accolades image: ${data.image}`);
      }

      const link = await AboutAccolades.create(data);
      await CacheService.invalidate("aboutAccolade");
      res.status(201).json({ success: true, data: link, message: "Item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "aboutAccolade";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const links = await AboutAccolades.findAll({ order: [["createdAt", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(links), 3600);
      res.json({ success: true, data: links });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `aboutAccolade_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(link), 3600);
      res.json({ success: true, data: link });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      console.log(req.files);

      const updateData = { ...req.body };
      const oldImage = link.image;
      const oldHighlightImage = link.highlight_image;

      if (req.files?.image) {
        updateData.image = `/uploads/about-accolades/${req.files.image[0].filename}`;
        Logger.info(`Updated image for AboutAccolade ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await AboutAccoladesController.deleteFile(oldImage);
        }
      }

      if (req.files?.highlight_image) {
        updateData.highlight_image = `/uploads/about-accolades/${req.files.highlight_image[0].filename}`;
        Logger.info(`Updated highlight image for AboutAccolade ID ${id}: ${updateData.highlight_image}`);
        if (oldHighlightImage) {
          await AboutAccoladesController.deleteFile(oldHighlightImage);
        }
      }

      await link.update(updateData);
      await CacheService.invalidate("aboutAccolade");
      await CacheService.invalidate(`aboutAccolade_${id}`);
      res.json({ success: true, data: link, message: "Item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      const oldImage = link.image;
      const oldHighlightImage = link.highlight_image;
      await link.destroy();

      if (oldImage) {
        await AboutAccoladesController.deleteFile(oldImage);
      }

      if (oldHighlightImage) {
        await AboutAccoladesController.deleteFile(oldHighlightImage);
      }

      await CacheService.invalidate("aboutAccolade");
      await CacheService.invalidate(`aboutAccolade_${id}`);
      res.json({ success: true, message: "Item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutAccoladesController;
