const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const SocialMediaIcons = models.SocialMediaIcons;

class SocialMediaIconsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted icon: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete icon ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.icon = `/uploads/social-media-icons/${req.file.filename}`;
        Logger.info(`Uploaded icon for SocialMediaIcon: ${updateData.icon}`);
      }

      const socialMediaIcon = await SocialMediaIcons.create(updateData);

      await CacheService.invalidate("socialMediaIcons");
      res.status(201).json({ success: true, data: socialMediaIcon, message: "Social Media Icon created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "socialMediaIcons";
      const cachedData = await CacheService.get(cacheKey);

    //   if (cachedData) {
    //     return res.json({ success: true, data: JSON.parse(cachedData) });
    //   }

      const socialMediaIcons = await SocialMediaIcons.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(socialMediaIcons), 3600);
      res.json({ success: true, data: socialMediaIcons });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `socialMediaIcon_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(socialMediaIcon), 3600);
      res.json({ success: true, data: socialMediaIcon });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      const updateData = { ...req.body };
      let oldFile = socialMediaIcon.icon;

      if (req.file) {
        updateData.icon = `/uploads/social-media-icons/${req.file.filename}`;
        Logger.info(`Updated icon for SocialMediaIcon ID ${id}: ${updateData.icon}`);
        if (oldFile) {
          await SocialMediaIconsController.deleteFile(oldFile);
        }
      }

      await socialMediaIcon.update(updateData);

      await CacheService.invalidate("socialMediaIcons");
      await CacheService.invalidate(`socialMediaIcon_${id}`);
      res.json({ success: true, data: socialMediaIcon, message: "Social Media Icon updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const socialMediaIcon = await SocialMediaIcons.findByPk(id);
      if (!socialMediaIcon) {
        throw new CustomError("Social Media Icon not found", 404);
      }

      const oldFile = socialMediaIcon.icon;
      await socialMediaIcon.destroy();

      if (oldFile) {
        await SocialMediaIconsController.deleteFile(oldFile);
      }

      await CacheService.invalidate("socialMediaIcons");
      await CacheService.invalidate(`socialMediaIcon_${id}`);
      res.json({ success: true, message: "Social Media Icon deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SocialMediaIconsController;
