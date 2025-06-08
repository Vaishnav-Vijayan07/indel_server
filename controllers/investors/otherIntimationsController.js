const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const OtherIntimations = models.OtherIntimations;

class OtherIntimationsController {
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

  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.files) {
        if (req.files.record_date_document) {
          data.record_date_document = `/uploads/investors/other-intimations/${req.files.record_date_document[0].filename}`;
          Logger.info(`Uploaded record date document: ${data.record_date_document}`);
        }
        if (req.files.interest_payment_document) {
          data.interest_payment_document = `/uploads/investors/other-intimations/${req.files.interest_payment_document[0].filename}`;
          Logger.info(`Uploaded interest payment document: ${data.interest_payment_document}`);
        }
      }

      const otherIntimation = await OtherIntimations.create(data);
      await CacheService.invalidate("OtherIntimations");
      res.status(201).json({ success: true, data: otherIntimation, message: "Other Intimation created" });
    } catch (error) {
      if (req.files) {
        if (req.files.record_date_document) {
          await OtherIntimationsController.deleteFile(
            `/uploads/investors/other-intimations/${req.files.record_date_document[0].filename}`
          );
        }
        if (req.files.interest_payment_document) {
          await OtherIntimationsController.deleteFile(
            `/uploads/investors/other-intimations/${req.files.interest_payment_document[0].filename}`
          );
        }
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "OtherIntimations";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const otherIntimations = await OtherIntimations.findAll({
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
        order: [["month_date", "DESC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(otherIntimations), 3600);
      res.json({ success: true, data: otherIntimations });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `otherIntimation_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const otherIntimation = await OtherIntimations.findByPk(id, {
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
      });
      if (!otherIntimation) {
        throw new CustomError("Other Intimation not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(otherIntimation), 3600);
      res.json({ success: true, data: otherIntimation });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const otherIntimation = await OtherIntimations.findByPk(id);
      if (!otherIntimation) {
        throw new CustomError("Other Intimation not found", 404);
      }

      const updateData = { ...req.body };
      const oldRecordDate = otherIntimation.record_date_document;
      const oldInterestPayment = otherIntimation.interest_payment_document;

      if (req.files) {
        if (req.files.record_date_document) {
          updateData.record_date_document = `/uploads/investors/other-intimations/${req.files.record_date_document[0].filename}`;
          Logger.info(`Updated record date document for Other Intimation ID ${id}: ${updateData.record_date_document}`);
          if (oldRecordDate) {
            await OtherIntimationsController.deleteFile(oldRecordDate);
          }
        }
        if (req.files.interest_payment_document) {
          updateData.interest_payment_document = `/uploads/investors/other-intimations/${req.files.interest_payment_document[0].filename}`;
          Logger.info(`Updated interest payment document for Other Intimation ID ${id}: ${updateData.interest_payment_document}`);
          if (oldInterestPayment) {
            await OtherIntimationsController.deleteFile(oldInterestPayment);
          }
        }
      }

      await otherIntimation.update(updateData);
      await CacheService.invalidate("OtherIntimations");
      await CacheService.invalidate(`otherIntimation_${id}`);
      res.json({ success: true, data: otherIntimation, message: "Other Intimation updated" });
    } catch (error) {
      if (req.files) {
        if (req.files.record_date_document) {
          await OtherIntimationsController.deleteFile(
            `/uploads/investors/other-intimations/${req.files.record_date_document[0].filename}`
          );
        }
        if (req.files.interest_payment_document) {
          await OtherIntimationsController.deleteFile(
            `/uploads/investors/other-intimations/${req.files.interest_payment_document[0].filename}`
          );
        }
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const otherIntimation = await OtherIntimations.findByPk(id);
      if (!otherIntimation) {
        throw new CustomError("Other Intimation not found", 404);
      }

      const oldRecordDate = otherIntimation.record_date_document;
      const oldInterestPayment = otherIntimation.interest_payment_document;
      await otherIntimation.destroy();

      if (oldRecordDate) {
        await OtherIntimationsController.deleteFile(oldRecordDate);
      }
      if (oldInterestPayment) {
        await OtherIntimationsController.deleteFile(oldInterestPayment);
      }

      await CacheService.invalidate("OtherIntimations");
      await CacheService.invalidate(`otherIntimation_${id}`);
      res.json({ success: true, message: "Other Intimation deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OtherIntimationsController;
