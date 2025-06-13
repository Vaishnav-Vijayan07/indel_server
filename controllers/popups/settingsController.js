const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const PopupSettings = models.PopupSettings;

class PopupSettingsController {
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

  static async get(req, res, next) {
    try {
      const cacheKey = "PopupSettings";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const settings = await PopupSettings.findOne();
      if (!settings) {
        throw new CustomError("Popup Settings not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(settings), 3600);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const settings = await PopupSettings.findOne();
      if (!settings) {
        throw new CustomError("Popup Settings not found", 404);
      }

      const updateData = { ...req.body };
      const oldLogo = settings.logo;
      const oldBannerImage = settings.banner_popup_image;

      const { service_popup_status, banner_popup_status } = req.body;
      const serviceStatus = service_popup_status === "true" || service_popup_status === true;
      const bannerStatus = banner_popup_status === "true" || banner_popup_status === true;

      // If service popup is being enabled, disable banner popup
      if (serviceStatus && bannerStatus) {
        updateData.service_popup_status = true;
        updateData.banner_popup_status = false;
      }
      // If banner popup is being enabled, disable service popup
      else if (bannerStatus) {
        updateData.banner_popup_status = true;
        updateData.service_popup_status = false;
      }
      // If both are false, keep them false
      else {
        updateData.service_popup_status = false;
        updateData.banner_popup_status = false;
      }

      if (req.files?.logo) {
        updateData.logo = `/uploads/popup-settings/${req.files.logo[0].filename}`;
        Logger.info(`Updated logo for PopupSettings: ${updateData.logo}`);
        if (oldLogo) {
          await PopupSettingsController.deleteFile(oldLogo);
        }
      }

      if (req.files?.banner_popup_image) {
        updateData.banner_popup_image = `/uploads/popup-settings/${req.files.banner_popup_image[0].filename}`;
        Logger.info(`Updated banner popup image for PopupSettings: ${updateData.banner_popup_image}`);
        if (oldBannerImage) {
          await PopupSettingsController.deleteFile(oldBannerImage);
        }
      }

      await settings.update(updateData);

      await CacheService.invalidate("PopupSettings");
      res.json({ success: true, data: settings, message: "Popup Settings updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PopupSettingsController;
