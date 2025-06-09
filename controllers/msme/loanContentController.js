const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const logger = require("../../services/logger");
const CustomError = require("../../utils/customError");
const fs = require("fs").promises;
const path = require("path");

const MsmeLoanContent = models.MsmeLoanContent;

class MsmeLoanContentController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "msmeLoanContent";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const data = await MsmeLoanContent.findOne();
      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const entry = await MsmeLoanContent.findOne();
      if (!entry) throw new CustomError("MSME Loan Content not found", 404);

      const updateData = { ...req.body };

      const why_msme_loan_image = req.file;
      if (why_msme_loan_image) {
        updateData.why_msme_loan_image = `/uploads/msme-loan-content/${why_msme_loan_image.filename}`;
        logger.info(`Uploaded why_msme_loan_image for MsmeLoanContent: ${updateData.why_msme_loan_image}`);
        await MsmeLoanContentController.deleteFile(entry.why_msme_loan_image);
      }

      await entry.update(updateData);

      await CacheService.invalidate("msmeLoanContent");
      await CacheService.invalidate("webMSMELoan");
      res.json({ success: true, data: entry, message: "MSME Loan Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeLoanContentController;
