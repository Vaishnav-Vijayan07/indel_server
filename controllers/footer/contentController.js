const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const FooterContent = models.FooterContent;

class FooterContentController {
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
      const cacheKey = "FooterContent";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const content = await FooterContent.findOne();
      if (!content) {
        throw new CustomError("Footer Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await FooterContent.findOne();
      if (!content) {
        throw new CustomError("Footer Content not found", 404);
      }

      const updateData = { ...req.body };

      // Existing values for cleanup
      const oldLogo = content.logo;
      const oldBranchLocatorIconMobile = content.branch_locator_icon_mobile;
      const oldBranchLocatorIconWeb = content.branch_locator_icon_web;
      const oldTollFreeIconMobile = content.toll_free_icon_mobile;
      const oldTollFreeIconWeb = content.toll_free_icon_web;

      if (req.files?.logo) {
        updateData.logo = `/uploads/footer-content/${req.files.logo[0].filename}`;
        Logger.info(`Updated logo for FooterContent: ${updateData.logo}`);
        if (oldLogo) {
          await FooterContentController.deleteFile(oldLogo);
        }
      }

      if (req.files?.branch_locator_icon_mobile) {
        updateData.branch_locator_icon_mobile = `/uploads/footer-content/${req.files.branch_locator_icon_mobile[0].filename}`;
        Logger.info(`Updated Branch Locator Icon (Mobile) for FooterContent: ${updateData.branch_locator_icon_mobile}`);
        if (oldBranchLocatorIconMobile) {
          await FooterContentController.deleteFile(oldBranchLocatorIconMobile);
        }
      }

      if (req.files?.branch_locator_icon_web) {
        updateData.branch_locator_icon_web = `/uploads/footer-content/${req.files.branch_locator_icon_web[0].filename}`;
        Logger.info(`Updated Branch Locator Icon (Web) for FooterContent: ${updateData.branch_locator_icon_web}`);
        if (oldBranchLocatorIconWeb) {
          await FooterContentController.deleteFile(oldBranchLocatorIconWeb);
        }
      }

      if (req.files?.toll_free_icon_mobile) {
        updateData.toll_free_icon_mobile = `/uploads/footer-content/${req.files.toll_free_icon_mobile[0].filename}`;
        Logger.info(`Updated Toll Free Icon (Mobile) for FooterContent: ${updateData.toll_free_icon_mobile}`);
        if (oldTollFreeIconMobile) {
          await FooterContentController.deleteFile(oldTollFreeIconMobile);
        }
      }

      if (req.files?.toll_free_icon_web) {
        updateData.toll_free_icon_web = `/uploads/footer-content/${req.files.toll_free_icon_web[0].filename}`;
        Logger.info(`Updated Toll Free Icon (Web) for FooterContent: ${updateData.toll_free_icon_web}`);
        if (oldTollFreeIconWeb) {
          await FooterContentController.deleteFile(oldTollFreeIconWeb);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("FooterContent");
      res.json({ success: true, data: content, message: "Footer Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FooterContentController;
