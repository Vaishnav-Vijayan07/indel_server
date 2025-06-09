const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MsmeOfferings = models.MsmeOfferings;

class MsmeOfferingsController {
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
        updateData.icon = `/uploads/msme-offerings/${req.file.filename}`;
        Logger.info(`Uploaded icon for MsmeOffering: ${updateData.icon}`);
      }

      const offering = await MsmeOfferings.create(updateData);

      await CacheService.invalidate("msmeOfferings");
      res.status(201).json({ success: true, data: offering, message: "MSME Offering created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeOfferings";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const offerings = await MsmeOfferings.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(offerings), 3600);
      res.json({ success: true, data: offerings });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `msmeOffering_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const offering = await MsmeOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("MSME Offering not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(offering), 3600);
      res.json({ success: true, data: offering });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const offering = await MsmeOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("MSME Offering not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = offering.icon;

      if (req.file) {
        updateData.icon = `/uploads/msme-offerings/${req.file.filename}`;
        Logger.info(`Updated icon for MsmeOffering ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await MsmeOfferingsController.deleteFile(oldIcon);
        }
      }

      await offering.update(updateData);

      await CacheService.invalidate("msmeOfferings");
      await CacheService.invalidate(`msmeOffering_${id}`);
      res.json({ success: true, data: offering, message: "MSME Offering updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const offering = await MsmeOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("MSME Offering not found", 404);
      }

      const oldIcon = offering.icon;
      await offering.destroy();

      if (oldIcon) {
        await MsmeOfferingsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("msmeOfferings");
      await CacheService.invalidate(`msmeOffering_${id}`);
      res.json({ success: true, message: "MSME Offering deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeOfferingsController;
