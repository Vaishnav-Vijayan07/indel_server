const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const HistoryInceptionsYears = models.HistoryInceptionsYears;

class HistoryInceptionYearsController {
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
      if (req.file) {
        updateData.image = `/uploads/history-inception-years/${req.file.filename}`;
        Logger.info(`Uploaded icon for HistoryInceptionsYears: ${updateData.image}`);
      }

      const step = await HistoryInceptionsYears.create(updateData);

      await CacheService.invalidate("HistoryInceptionsYears");
      res.status(201).json({ success: true, data: step });
      await CacheService.invalidate("webHistoryData");
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "HistoryInceptionsYears";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const steps = await HistoryInceptionsYears.findAll({
        order: [["createdAt", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(steps), 3600);
      res.json({ success: true, data: steps });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `HistoryIncYear_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const step = await HistoryInceptionsYears.findByPk(id);
      if (!step) {
        throw new CustomError("Year not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(step), 3600);
      res.json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HistoryInceptionsYears.findByPk(id);
      if (!step) {
        throw new CustomError("Year not found", 404);
      }

      const updateData = { ...req.body };
      let oldIconUrl = step.image;

      if (req.file) {
        updateData.image = `/uploads/history-inception-years/${req.file.filename}`;
        Logger.info(`Updated icon for HistoryInceptionsYears ID ${id}: ${updateData.image}`);
        if (oldIconUrl) {
          await HistoryInceptionYearsController.deleteFile(oldIconUrl);
        }
      }

      await step.update(updateData);

      await CacheService.invalidate("HistoryInceptionsYears");
      await CacheService.invalidate(`HistoryIncYear_${id}`);
      await CacheService.invalidate("webHistoryData");

      res.json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HistoryInceptionsYears.findByPk(id);
      if (!step) {
        throw new CustomError("Year not found", 404);
      }

      const oldIconUrl = step.image;
      await step.destroy();

      if (oldIconUrl) {
        await HistoryInceptionYearsController.deleteFile(oldIconUrl);
      }

      await CacheService.invalidate("HistoryInceptionsYears");
      await CacheService.invalidate(`HistoryIncYear_${id}`);
      res.json({ success: true, message: "Year deleted", data: id });
      await CacheService.invalidate("webHistoryData");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HistoryInceptionYearsController;
