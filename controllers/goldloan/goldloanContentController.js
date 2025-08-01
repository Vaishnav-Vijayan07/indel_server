const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const GoldLoanContent = models.GoldloanContent;

class GoldLoanContentController {
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
      const cacheKey = "GoldLoanContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await GoldLoanContent.findOne();
      if (!content) {
        throw new CustomError("Gold Loan Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await GoldLoanContent.findOne();
      if (!content) {
        throw new CustomError("Gold Loan Content not found", 404);
      }

      const updateData = { ...req.body };

      if (req.files) {
        if (req.files.steps_image) {
          updateData.steps_image = `/uploads/gold-loan-content/${req.files.steps_image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.steps_image}`);
          await GoldLoanContentController.deleteFile(content.steps_image);
        }
        if (req.files.banner_image) {
          updateData.banner_image = `/uploads/gold-loan-content/${req.files.banner_image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.banner_image}`);
          await GoldLoanContentController.deleteFile(content.banner_image);
        }
        if (req.files.hassle_free_image) {
          updateData.hassle_free_image = `/uploads/gold-loan-content/${req.files.hassle_free_image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.hassle_free_image}`);
          await GoldLoanContentController.deleteFile(content.hassle_free_image);
        }
        if (req.files.banner_image_mobile) {
          updateData.banner_image_mobile = `/uploads/gold-loan-content/${req.files.banner_image_mobile[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.banner_image_mobile}`);
          await GoldLoanContentController.deleteFile(content.banner_image_mobile);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("GoldLoanContent");
      await CacheService.invalidate("webGoldLoan");

      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoldLoanContentController;
