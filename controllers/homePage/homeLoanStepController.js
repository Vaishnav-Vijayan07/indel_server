const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const cacheService = require("../../services/cacheService");

const HomeLoanStep = models.HomeLoanStep;

class HomeLoanStepController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        filePath.replace("/uploads/", ""),
      );
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
      await CacheService.invalidate("webHomeData");
      await cacheService.invalidatePattern("homeLoanSteps_page_*")

      res.status(201).json({ success: true, data: step });
      await CacheService.invalidate("webHomeData");
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // Legacy path: unchanged response shape/behavior for backward compatibility
      if (!page && !limit) {
        const cacheKey = "homeLoanSteps";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const steps = await HomeLoanStep.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(steps), 3600);
        return res.json({
          success: true,
          data: steps,
          message: "Home Loan Steps fetched",
        });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search
        ? null
        : `homeLoanSteps_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await HomeLoanStep.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
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
        Logger.info(
          `Updated icon for HomeLoanStep ID ${id}: ${updateData.icon_url}`,
        );
        if (oldIconUrl) {
          await HomeLoanStepController.deleteFile(oldIconUrl);
        }
      }

      await step.update(updateData);

      await CacheService.invalidate("homeLoanSteps");
      await CacheService.invalidate(`homeLoanStep_${id}`);
      await cacheService.invalidatePattern("homeLoanSteps_page_*");

      await CacheService.invalidate("webHomeData");

      res.json({
        success: true,
        data: step,
        message: "Home Loan Step updated",
      });
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
      await cacheService.invalidatePattern("homeLoanSteps_page_*");
      res.json({ success: true, message: "Home Loan Step deleted", data: id });
      await CacheService.invalidate("webHomeData");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HomeLoanStepController;
