const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const EmployeeBenefits = models.EmployeeBenefits;

class EmployeeBenefitsController {
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
        updateData.icon = `/uploads/employee-benefits/${req.file.filename}`;
        Logger.info(`Uploaded icon for EmployeeBenefit: ${updateData.icon}`);
      }

      const benefit = await EmployeeBenefits.create(updateData);

      await CacheService.invalidate("employeeBenefits");
      res.status(201).json({ success: true, data: benefit, message: "Employee Benefit created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "employeeBenefits";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const benefits = await EmployeeBenefits.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(benefits), 3600);
      res.json({ success: true, data: benefits });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `employeeBenefit_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const benefit = await EmployeeBenefits.findByPk(id);
      if (!benefit) {
        throw new CustomError("Employee Benefit not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(benefit), 3600);
      res.json({ success: true, data: benefit });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const benefit = await EmployeeBenefits.findByPk(id);
      if (!benefit) {
        throw new CustomError("Employee Benefit not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = benefit.icon;

      if (req.file) {
        updateData.icon = `/uploads/employee-benefits/${req.file.filename}`;
        Logger.info(`Updated icon for EmployeeBenefit ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await EmployeeBenefitsController.deleteFile(oldIcon);
        }
      }

      await benefit.update(updateData);

      await CacheService.invalidate("employeeBenefits");
      await CacheService.invalidate(`employeeBenefit_${id}`);
      res.json({ success: true, data: benefit, message: "Employee Benefit updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const benefit = await EmployeeBenefits.findByPk(id);
      if (!benefit) {
        throw new CustomError("Employee Benefit not found", 404);
      }

      const oldIcon = benefit.icon;
      await benefit.destroy();

      if (oldIcon) {
        await EmployeeBenefitsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("employeeBenefits");
      await CacheService.invalidate(`employeeBenefit_${id}`);
      res.json({ success: true, message: "Employee Benefit deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmployeeBenefitsController;
