const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanAgainstPropertyTargetedAudience = models.LoanAgainstPropertyTargetedAudience;

class LoanAgainstPropertTargetedAudienceController {
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
        updateData.image = `/uploads/loan-against-property-targeted-audience/${req.file.filename}`;
        Logger.info(`Uploaded image for LoanAgainstPropertyTargetedAudience: ${updateData.image}`);
      }

      const audience = await LoanAgainstPropertyTargetedAudience.create(updateData);

      await CacheService.invalidate("LoanAgainstPropertyTargetedAudience");
      res.status(201).json({ success: true, data: audience, message: "Loan Against Property Targeted Audience created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "LoanAgainstPropertyTargetedAudience";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const audiences = await LoanAgainstPropertyTargetedAudience.findAll({
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
      const cacheKey = `LoanAgainstPropertyTargetedAudience_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const audience = await LoanAgainstPropertyTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("Loan Against Property Targeted Audience not found", 404);
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
      const audience = await LoanAgainstPropertyTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("Loan Against Property Targeted Audience not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = audience.image;

      if (req.file) {
        updateData.image = `/uploads/loan-against-property-targeted-audience/${req.file.filename}`;
        Logger.info(`Updated image for LoanAgainstPropertyTargetedAudience ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await LoanAgainstPropertTargetedAudienceController.deleteFile(oldImage);
        }
      }

      await audience.update(updateData);

      await CacheService.invalidate("LoanAgainstPropertyTargetedAudience");
      await CacheService.invalidate(`LoanAgainstPropertyTargetedAudience_${id}`);
      res.json({ success: true, data: audience, message: "Loan Against Property Targeted Audience updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const audience = await LoanAgainstPropertyTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("Loan Against Property Targeted Audience not found", 404);
      }

      const oldImage = audience.image;
      await audience.destroy();

      if (oldImage) {
        await LoanAgainstPropertTargetedAudienceController.deleteFile(oldImage);
      }

      await CacheService.invalidate("LoanAgainstPropertyTargetedAudience");
      await CacheService.invalidate(`LoanAgainstPropertyTargetedAudience_${id}`);
      res.json({ success: true, message: "Loan Against Property Targeted Audience deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanAgainstPropertTargetedAudienceController;
