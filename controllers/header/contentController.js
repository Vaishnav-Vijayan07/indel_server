const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const HeaderContents = models.HeaderContents;

class HeaderContentsController {
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

  static async get(req, res, next) {
    try {
      const cacheKey = "HeaderContents";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const content = await HeaderContents.findOne();
      if (!content) {
        throw new CustomError("Header Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await HeaderContents.findOne();
      if (!content) {
        throw new CustomError("Header Content not found", 404);
      }

      const updateData = { ...req.body };
      const oldAppleIcon = content.apple_dowload_icon;
      const oldAndroidIcon = content.andrioid_download_icon;
      const oldAppleIconMobile = content.apple_dowload_icon_mobile;
      const oldAndroidIconMobile = content.andrioid_download_icon_mobile;
      const oldLogo = content.logo;

      if (req.files?.logo) {
        updateData.logo = `/uploads/header-contents/${req.files.logo[0].filename}`;
        Logger.info(`Updated logo for HeaderContents: ${updateData.logo}`);
        if (oldLogo) {
          await HeaderContentsController.deleteFile(oldLogo);
        }
      }

      if (req.files?.apple_dowload_icon) {
        updateData.apple_dowload_icon = `/uploads/header-contents/${req.files.apple_dowload_icon[0].filename}`;
        Logger.info(`Updated Apple download icon for HeaderContents: ${updateData.apple_dowload_icon}`);
        if (oldAppleIcon) {
          await HeaderContentsController.deleteFile(oldAppleIcon);
        }
      }

      if (req.files?.andrioid_download_icon) {
        updateData.andrioid_download_icon = `/uploads/header-contents/${req.files.andrioid_download_icon[0].filename}`;
        Logger.info(`Updated Android download icon for HeaderContents: ${updateData.andrioid_download_icon}`);
        if (oldAndroidIcon) {
          await HeaderContentsController.deleteFile(oldAndroidIcon);
        }
      }

      if (req.files?.andrioid_download_icon_mobile) {
        updateData.andrioid_download_icon_mobile = `/uploads/header-contents/${req.files.andrioid_download_icon_mobile[0].filename}`;
        Logger.info(`Updated Android download icon for HeaderContents: ${updateData.andrioid_download_icon_mobile}`);
        if (oldAndroidIcon) {
          await HeaderContentsController.deleteFile(oldAndroidIconMobile);
        }
      }

      if (req.files?.apple_download_icon_mobile) {
        updateData.apple_download_icon_mobile = `/uploads/header-contents/${req.files.apple_download_icon_mobile[0].filename}`;
        Logger.info(`Updated Android download icon for HeaderContents: ${updateData.apple_download_icon_mobile}`);
        if (oldAndroidIcon) {
          await HeaderContentsController.deleteFile(oldAppleIconMobile);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("HeaderContents");
      res.json({ success: true, data: content, message: "Header Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HeaderContentsController;
