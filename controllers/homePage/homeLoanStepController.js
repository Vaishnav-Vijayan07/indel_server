const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const HomeLoanStep = models.HomeLoanStep;

class HomeLoanStepController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "uploads", filePath.replace("/uploads/", ""));
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
        updateData.icon_url = `/uploads/home-loan-steps/${req.file.filename}`;
        Logger.info(`Uploaded icon for HomeLoanStep: ${updateData.icon_url}`);
      }

      const step = await HomeLoanStep.create(updateData);

      await CacheService.invalidate("homeLoanSteps");
      res.status(201).json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "homeLoanSteps";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const steps = await HomeLoanStep.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(steps), 3600);
      res.json({ success: true, data: steps });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `homeLoanStep_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const step = await HomeLoanStep.findByPk(id);
      if (!step) {
        throw new CustomError("Home Loan Step not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(step), 3600);
      res.json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HomeLoanStep.findByPk(id);
      if (!step) {
        throw new CustomError("Home Loan Step not found", 404);
      }

      const updateData = { ...req.body };
      let oldIconUrl = step.icon_url;

      if (req.file) {
        updateData.icon_url = `/uploads/home-loan-steps/${req.file.filename}`;
        Logger.info(`Updated icon for HomeLoanStep ID ${id}: ${updateData.icon_url}`);
        if (oldIconUrl) {
          await HomeLoanStepController.deleteFile(oldIconUrl);
        }
      }

      await step.update(updateData);

      await CacheService.invalidate("homeLoanSteps");
      await CacheService.invalidate(`homeLoanStep_${id}`);
      res.json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const step = await HomeLoanStep.findByPk(id);
      if (!step) {
        throw new CustomError("Home Loan Step not found", 404);
      }

      const oldIconUrl = step.icon_url;
      await step.destroy();

      if (oldIconUrl) {
        await HomeLoanStepController.deleteFile(oldIconUrl);
      }

      await CacheService.invalidate("homeLoanSteps");
      await CacheService.invalidate(`homeLoanStep_${id}`);
      res.json({ success: true, message: "Home Loan Step deleted",data:id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomeLoanStepController;
