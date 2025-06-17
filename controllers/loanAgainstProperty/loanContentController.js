const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const logger = require("../../services/logger");
const CustomError = require("../../utils/customError");
const fs = require("fs").promises;
const path = require("path");

const LoanAgainstPropertyContent = models.LoanAgainstPropertyContent;

class LoanAgainstPropertyContentController {
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
      const cacheKey = "LoanAgainstPropertyContent";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const data = await LoanAgainstPropertyContent.findOne();
      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const entry = await LoanAgainstPropertyContent.findOne();
      if (!entry) throw new CustomError("Loan Against Property Content not found", 404);

      const updateData = { ...req.body };

      const why_loan_against_property_image = req.file;
      if (why_loan_against_property_image) {
        updateData.why_loan_against_property_image = `/uploads/loan-against-property-content/${why_loan_against_property_image.filename}`;
        logger.info(`Uploaded why_loan_against_property_image for LoanAgainstPropertyContent: ${updateData.why_loan_against_property_image}`);
        await LoanAgainstPropertyContentController.deleteFile(entry.why_loan_against_property_image);
      }

      await entry.update(updateData);

      await CacheService.invalidate("LoanAgainstPropertyContent");
      await CacheService.invalidate("webLoanAgainstProperty");
      res.json({ success: true, data: entry, message: "Loan Against Property Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanAgainstPropertyContentController;
