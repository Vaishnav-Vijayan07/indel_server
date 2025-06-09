const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CdLoanContent = models.CdLoanContent;

class CdLoanContentController {
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
      const cacheKey = "CdLoanContent";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const content = await CdLoanContent.findOne();
      if (!content) {
        throw new CustomError("CD Loan Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await CdLoanContent.findOne();
      if (!content) {
        throw new CustomError("CD Loan Content not found", 404);
      }

      const updateData = { ...req.body };

      if (req.files) {
        if (req.files.image) {
          updateData.image = `/uploads/cd-content/${req.files.image[0].filename}`;
          await CdLoanContentController.deleteFile(content.image);
        }
        if (req.files.covered_products_section_image) {
          updateData.covered_products_section_image = `/uploads/cd-content/${req.files.covered_products_section_image[0].filename}`;
          await CdLoanContentController.deleteFile(content.covered_products_section_image);
        }
        if (req.files.eligibility_criteria_icon) {
          updateData.eligibility_criteria_icon = `/uploads/cd-content/${req.files.eligibility_criteria_icon[0].filename}`;
          await CdLoanContentController.deleteFile(content.eligibility_criteria_icon);
        }
        if (req.files.feature_image) {
          updateData.feature_image = `/uploads/cd-content/${req.files.feature_image[0].filename}`;
          await CdLoanContentController.deleteFile(content.feature_image);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("CdLoanContent");
      await CacheService.invalidate("webCDLoan");
      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CdLoanContentController;
