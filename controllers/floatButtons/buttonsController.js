const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const FloatButtons = models.FloatButtons;

class FloatButtonsController {
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
      const updateData = { ...req.body };
      if (req.file) {
        updateData.icon = `/uploads/float-buttons/${req.file.filename}`;
        Logger.info(`Uploaded icon for FloatButton: ${updateData.icon}`);
      }

      const floatButton = await FloatButtons.create(updateData);

      await CacheService.invalidate("floatButtons");
      res.status(201).json({ success: true, data: floatButton, message: "Float Button created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "floatButtons";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const floatButtons = await FloatButtons.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(floatButtons), 3600);
      res.json({ success: true, data: floatButtons });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `floatButton_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(floatButton), 3600);
      res.json({ success: true, data: floatButton });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = floatButton.icon;

      if (req.file) {
        updateData.icon = `/uploads/float-buttons/${req.file.filename}`;
        Logger.info(`Updated icon for FloatButton ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await FloatButtonsController.deleteFile(oldIcon);
        }
      }

      await floatButton.update(updateData);

      await CacheService.invalidate("floatButtons");
      await CacheService.invalidate(`floatButton_${id}`);
      res.json({ success: true, data: floatButton, message: "Float Button updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const floatButton = await FloatButtons.findByPk(id);
      if (!floatButton) {
        throw new CustomError("Float Button not found", 404);
      }

      const oldIcon = floatButton.icon;
      await floatButton.destroy();

      if (oldIcon) {
        await FloatButtonsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("floatButtons");
      await CacheService.invalidate(`floatButton_${id}`);
      res.json({ success: true, message: "Float Button deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FloatButtonsController;
