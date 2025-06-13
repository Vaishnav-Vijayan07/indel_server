const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanAgainstProperty = models.LoanAgainstProperty;

class LoanAgainstPropertyController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "../../Uploads", filePath.replace(/^\/uploads\/images\//, ""));
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
      const cacheKey = "LoanAgainstProperty";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await LoanAgainstProperty.findOne();
      if (!content) {
        throw new CustomError("Loan Against Property Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await LoanAgainstProperty.findOne();
      if (!content) {
        throw new CustomError("Loan Against Property Content not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = content.why_lap_loan_image;

      if (req.file) {
        updateData.why_lap_loan_image = `/Uploads/images/loan-against-property/${req.file.filename}`;
        Logger.info(`Updated image for LoanAgainstProperty: ${updateData.why_lap_loan_image}`);
        if (oldImage) {
          await LoanAgainstPropertyController.deleteFile(oldImage);
        }
      }

      await content.update(updateData);

      await CacheService.invalidate("LoanAgainstProperty");
      res.json({ success: true, data: content, message: "Loan Against Property Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanAgainstPropertyController;
