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
      const fieldsToUpdate = ["logo", "branch_locator_icon_mobile", "branch_locator_icon_web", "toll_free_icon_mobile", "toll_free_icon_web"];

      const oldImages = {
        logo: content.logo,
        branch_locator_icon_mobile: content.branch_locator_icon_mobile,
        branch_locator_icon_web: content.branch_locator_icon_web,
        toll_free_icon_mobile: content.toll_free_icon_mobile,
        toll_free_icon_web: content.toll_free_icon_web,
      };

      fieldsToUpdate.forEach((field) => {
        if (req.files?.[field]?.[0]?.filename) {
          updateData[field] = `/uploads/footer-content/${req.files[field][0].filename}`;
          Logger.info(`Updated ${field} for FooterContent: ${updateData[field]}`);
          if (oldImages[field]) {
            FooterContentController.deleteFile(oldImages[field]);
          }
        }
      });

      await content.update(updateData);

      await CacheService.invalidate("FooterContent");
      res.json({ success: true, data: content, message: "Footer Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FooterContentController;
