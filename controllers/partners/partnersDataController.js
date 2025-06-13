const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Partners = models.Partners;

class PartnersController {
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
        updateData.logo = `/uploads/partners/${req.file.filename}`;
        Logger.info(`Uploaded image for Partners: ${updateData.logo}`);
      }

      const partners = await Partners.create(updateData);

      await CacheService.invalidate("Partners");
      res.status(201).json({ success: true, data: partners, message: "Partners created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "Partners";
      const cachedData = await CacheService.get(cacheKey);

    //   if (cachedData) {
    //     return res.json({ success: true, data: JSON.parse(cachedData) });
    //   }

      const partners = await Partners.findAll({
        order: [["order", "ASC"]],
        include: [{ model: models.PartnersTypes, as: "partnerType" }],
      });

      await CacheService.set(cacheKey, JSON.stringify(partners), 3600);
      res.json({ success: true, data: partners });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `partners_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(partners), 3600);
      res.json({ success: true, data: partners });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = partners.logo;

      if (req.file) {
        updateData.logo = `/uploads/partners/${req.file.filename}`;
        Logger.info(`Updated logo for Partners ID ${id}: ${updateData.logo}`);
        if (oldImage) {
          await PartnersController.deleteFile(oldImage);
        }
      }

      await partners.update(updateData);

      await CacheService.invalidate("Partners");
      await CacheService.invalidate(`partners_${id}`);
      res.json({ success: true, data: partners, message: "Partners updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const partners = await Partners.findByPk(id);
      if (!partners) {
        throw new CustomError("Partners not found", 404);
      }

      const oldImage = partners.logo;
      await partners.destroy();

      if (oldImage) {
        await PartnersController.deleteFile(oldImage);
      }

      await CacheService.invalidate("Partners");
      await CacheService.invalidate(`partners_${id}`);
      res.json({ success: true, message: "Partners deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PartnersController;
