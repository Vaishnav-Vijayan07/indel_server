const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const ServicesPageContent = models.ServiceContent;

class ServicesPageContentController {
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
      const cacheKey = "ServicesPageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await ServicesPageContent.findOne();
      if (!content) {
        throw new CustomError("Services page content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await ServicesPageContent.findOne();
      if (!content) {
        throw new CustomError("Services page content not found", 404);
      }

      const updateData = { ...req.body };

      if (req.files) {
        if (req.files.image) {
          updateData.image = `/uploads/service-page-content/${req.files.image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.image}`);
          await ServicesPageContentController.deleteFile(content.image);
        }
        if (req.files.banner_image) {
          updateData.banner_image = `/uploads/service-page-content/${req.files.banner_image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.banner_image}`);
          await ServicesPageContentController.deleteFile(content.banner_image);
        }
        if (req.files.gold_loan_image) {
          updateData.gold_loan_image = `/uploads/service-page-content/${req.files.gold_loan_image[0].filename}`;
          Logger.info(`Uploaded icon for GoldLoanContent: ${updateData.gold_loan_image}`);
          await ServicesPageContentController.deleteFile(content.gold_loan_image);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("ServicesPageContent");
      await CacheService.invalidate("webOurServices");
      await CacheService.invalidate("metaData:services");
      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServicesPageContentController;
