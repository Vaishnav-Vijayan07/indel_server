const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutMessageFromTeam = models.AboutMessageFromTeam;

class AboutMessageTeamController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..","..", "uploads", filePath.replace("/uploads/", ""));
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
      if (req.file) {
        data.image = `/uploads/about-message-teams/${req.file.filename}`;
        Logger.info(`Uploaded image for AboutMessageTeam: ${data.image}`);
      }

      const link = await AboutMessageFromTeam.create(data);
      await CacheService.invalidate("aboutMessageTeam");
      res.status(201).json({ success: true, data: link, message: "Item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "aboutMessageTeam";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const links = await AboutMessageFromTeam.findAll({ order: [["createdAt", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(links), 3600);
      res.json({ success: true, data: links });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `aboutMessageTeam_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const link = await AboutMessageFromTeam.findByPk(id);
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
      const link = await AboutMessageFromTeam.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = link.image;

      if (req.file) {
        updateData.image = `/uploads/about-message-teams/${req.file.filename}`;
        Logger.info(`Updated image for AboutMessageTeam ID ${id}: ${updateData.image}`);
        // if (oldImage) {
        //   await AboutMessageTeamController.deleteFile(oldImage);
        // }
      }

      await link.update(updateData);
      await CacheService.invalidate("aboutMessageTeam");
      await CacheService.invalidate(`aboutMessageTeam_${id}`);
      res.json({ success: true, data: link,message: "Item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutMessageFromTeam.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      const oldImage = link.image;
      await link.destroy();

      // if (oldImage) {
      //   await AboutMessageTeamController.deleteFile(oldImage);
      // }

      await CacheService.invalidate("aboutMessageTeam");
      await CacheService.invalidate(`aboutMessageTeam_${id}`);
      res.json({ success: true, message: "Item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutMessageTeamController;
