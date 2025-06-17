const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanTypes = models.LoanAgainstPropertyTypes;

class LoanTypesController {
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

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/loan-against-property-types/${req.file.filename}`;
        Logger.info(`Uploaded image for LoanType: ${updateData.image}`);
      }

      const loanType = await LoanTypes.create(updateData);

      await CacheService.invalidate("loanAgainstPropertyTypes");
      res.status(201).json({ success: true, data: loanType, message: "Loan Against Property Types created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "loanAgainstPropertyTypes";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const loanTypes = await LoanTypes.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(loanTypes), 3600);
      res.json({ success: true, data: loanTypes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `loanAgainstPropertyType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const loanType = await LoanTypes.findByPk(id);
      if (!loanType) {
        throw new CustomError("Loan Against Property Types not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(loanType), 3600);
      res.json({ success: true, data: loanType });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const loanType = await LoanTypes.findByPk(id);
      if (!loanType) {
        throw new CustomError("Loan Against Property Types not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = loanType.image;

      if (req.file) {
        updateData.image = `/uploads/loan-against-property-types/${req.file.filename}`;
        Logger.info(`Updated image for LoanType ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await LoanTypesController.deleteFile(oldImage);
        }
      }

      await loanType.update(updateData);

      await CacheService.invalidate("loanAgainstPropertyTypes");
      await CacheService.invalidate(`loanType_${id}`);
      res.json({ success: true, data: loanType, message: "Loan Against Property Types updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const loanType = await LoanTypes.findByPk(id);
      if (!loanType) {
        throw new CustomError("Loan Against Property Types not found", 404);
      }

      const oldImage = loanType.image;
      await loanType.destroy();

      if (oldImage) {
        await LoanTypesController.deleteFile(oldImage);
      }

      await CacheService.invalidate("loanAgainstPropertyTypes");
      await CacheService.invalidate(`loanType_${id}`);
      res.json({ success: true, message: "Loan Against Property Types deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanTypesController;
