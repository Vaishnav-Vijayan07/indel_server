const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutStatistics = models.AboutStatistics;

class AboutStatisticsController {
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
      console.log(req.file)
      if (req.file) {
        data.icon = `/uploads/about-statistics/${req.file.filename}`;
        Logger.info(`Uploaded image for AboutStatistics: ${data.icon}`);
      }

      const link = await AboutStatistics.create(data);
      await CacheService.invalidate("aboutStatistics");
      res.status(201).json({ success: true, data: link, message: "About Statistics data created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "aboutStatistics";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const links = await AboutStatistics.findAll({ order: [["createdAt", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(links), 3600);
      res.json({ success: true, data: links });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `aboutStatistics_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const link = await AboutStatistics.findByPk(id);
      if (!link) {
        throw new CustomError("About Statistics data not found", 404);
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
      const link = await AboutStatistics.findByPk(id);
      if (!link) {
        throw new CustomError("About Statistics data not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = link.icon;

      if (req.file) {
        updateData.icon = `/uploads/about-statistics/${req.file.filename}`;
        Logger.info(`Updated image for AboutStatistics ID ${id}: ${updateData.icon}`);
        if (oldImage) {
          await AboutStatisticsController.deleteFile(oldImage);
        }
      }

      await link.update(updateData);
      await CacheService.invalidate("aboutStatistics");
      await CacheService.invalidate(`aboutStatistics_${id}`);
      res.json({ success: true, data: link, message: "About Statistics data updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutStatistics.findByPk(id);
      if (!link) {
        throw new CustomError("About Statistics data not found", 404);
      }

      const oldImage = link.icon;
      await link.destroy();

      if (oldImage) {
        await AboutStatisticsController.deleteFile(oldImage);
      }

      await CacheService.invalidate("aboutStatistics");
      await CacheService.invalidate(`aboutStatistics_${id}`);
      res.json({ success: true, message: "About Statistics data deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutStatisticsController;
