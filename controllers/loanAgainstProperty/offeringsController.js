const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanAgainstPropertyOfferings = models.LoanAgainstPropertyOfferings;

class LoanAgainstPropertyOfferingsController {
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
    const updateData = { ...req.body };

    if (req.file) {
      updateData.icon = `/uploads/loan-against-property-offerings/${req.file.filename}`;
      Logger.info(`Uploaded icon for Loan Against Property Offering: ${updateData.icon}`);
    }

    const offering = await LoanAgainstPropertyOfferings.create(updateData);

    await CacheService.invalidate("LoanAgainstPropertyOfferings");
    res.status(201).json({ success: true, data: offering, message: "Loan Against Property Offering created" });
  } catch (error) {
    next(error);
  }
}


  static async getAll(req, res, next) {
    try {
      const cacheKey = "LoanAgainstPropertyOfferings";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const offerings = await LoanAgainstPropertyOfferings.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(offerings), 3600);
      res.json({ success: true, data: offerings });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `LoanAgainstPropertyOfferings_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const offering = await LoanAgainstPropertyOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("Loan Against Property Offering not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(offering), 3600);
      res.json({ success: true, data: offering });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const offering = await LoanAgainstPropertyOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("Loan Against Property Offering not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = offering.icon;

      if (req.file) {
        updateData.icon = `/uploads/Loan Against Property-offerings/${req.file.filename}`;
        Logger.info(`Updated icon for loan against property offerings ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await LoanAgainstPropertyOfferingsController.deleteFile(oldIcon);
        }
      }

      await offering.update(updateData);

      await CacheService.invalidate("LoanAgainstPropertyOfferings");
      await CacheService.invalidate(`LoanAgainstPropertyOfferings_${id}`);
      res.json({ success: true, data: offering, message: "Loan Against Property Offering updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const offering = await LoanAgainstPropertyOfferings.findByPk(id);
      if (!offering) {
        throw new CustomError("Loan Against Property Offering not found", 404);
      }

      const oldIcon = offering.icon;
      await offering.destroy();

      if (oldIcon) {
        await LoanAgainstPropertyOfferingsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("LoanAgainstPropertyOfferings");
      await CacheService.invalidate(`LoanAgainstPropertyOfferings_${id}`);
      res.json({ success: true, message: "Loan Against Property Offering deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanAgainstPropertyOfferingsController;
