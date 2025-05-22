const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const IndelValues = models.IndelValues;

class IndelValuesController {
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
        updateData.icon = `/uploads/indel-values/${req.file.filename}`;
        Logger.info(`Uploaded icon for IndelValue: ${updateData.icon}`);
      }

      const step = await IndelValues.create(updateData);

      await CacheService.invalidate("indelValues");
      await CacheService.invalidate("webIndelValueData");

      res.status(201).json({ success: true, data: step, message: "Indel value created successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "indelValues";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const steps = await IndelValues.findAll({
        order: [["order", "ASC"]],
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
      const cacheKey = `indelValue_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const step = await IndelValues.findByPk(id);
      if (!step) {
        throw new CustomError("Indel value not found", 404);
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
      const step = await IndelValues.findByPk(id);
      if (!step) {
        throw new CustomError("Indel value not found", 404);
      }

      const updateData = { ...req.body };
      let oldIconUrl = step.icon;

      if (req.file) {
        updateData.icon = `/uploads/indel-values/${req.file.filename}`;
        Logger.info(`Updated icon for IndelValue ID ${id}: ${updateData.icon}`);
        if (oldIconUrl) {
          await IndelValuesController.deleteFile(oldIconUrl);
        }
      }

      await step.update(updateData);

      await CacheService.invalidate("indelValues");
      await CacheService.invalidate(`indelValue_${id}`);
      await CacheService.invalidate("webIndelValueData");

      res.json({ success: true, data: step, message: "Indel value updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const step = await IndelValues.findByPk(id);
      if (!step) {
        throw new CustomError("Indel value not found", 404);
      }

      const oldIconUrl = step.icon;
      await step.destroy();

      if (oldIconUrl) {
        await IndelValuesController.deleteFile(oldIconUrl);
      }

      await CacheService.invalidate("indelValues");
      await CacheService.invalidate(`indelValue_${id}`);
      await CacheService.invalidate("webIndelValueData");

      res.json({ success: true, message: "Indel value deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IndelValuesController;
