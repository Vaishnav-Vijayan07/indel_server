const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MsmeTargetedAudience = models.MsmeTargetedAudience;

class MsmeTargetedAudienceController {
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
        updateData.image = `/uploads/msme-targeted-audience/${req.file.filename}`;
        Logger.info(`Uploaded image for MsmeTargetedAudience: ${updateData.image}`);
      }

      const audience = await MsmeTargetedAudience.create(updateData);

      await CacheService.invalidate("msmeTargetedAudience");
      res.status(201).json({ success: true, data: audience, message: "MSME Targeted Audience created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeTargetedAudience";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const audiences = await MsmeTargetedAudience.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(audiences), 3600);
      res.json({ success: true, data: audiences });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `msmeTargetedAudience_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(audience), 3600);
      res.json({ success: true, data: audience });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = audience.image;

      if (req.file) {
        updateData.image = `/uploads/msme-targeted-audience/${req.file.filename}`;
        Logger.info(`Updated image for MsmeTargetedAudience ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await MsmeTargetedAudienceController.deleteFile(oldImage);
        }
      }

      await audience.update(updateData);

      await CacheService.invalidate("msmeTargetedAudience");
      await CacheService.invalidate(`msmeTargetedAudience_${id}`);
      res.json({ success: true, data: audience, message: "MSME Targeted Audience updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      const oldImage = audience.image;
      await audience.destroy();

      if (oldImage) {
        await MsmeTargetedAudienceController.deleteFile(oldImage);
      }

      await CacheService.invalidate("msmeTargetedAudience");
      await CacheService.invalidate(`msmeTargetedAudience_${id}`);
      res.json({ success: true, message: "MSME Targeted Audience deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeTargetedAudienceController;
