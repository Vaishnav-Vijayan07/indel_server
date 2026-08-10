const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MsmeLoanSupportedIndustries = models.MsmeLoanSupportedIndustries;

class MsmeLoanSupportedIndustriesController {
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
        updateData.icon = `/uploads/msme-loan-supported-industries/${req.file.filename}`;
        Logger.info(`Uploaded icon for MsmeLoanSupportedIndustry: ${updateData.icon}`);
      }

      const industry = await MsmeLoanSupportedIndustries.create(updateData);

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      await CacheService.invalidatePattern("msmeLoanSupportedIndustries_page_*");
      res.status(201).json({ success: true, data: industry, message: "MSME Loan Supported Industry created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "msmeLoanSupportedIndustries";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const industries = await MsmeLoanSupportedIndustries.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(industries), 3600);
        return res.json({ success: true, data: industries });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search (search on title, description)
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search.trim()}%` } },
          { description: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `msmeLoanSupportedIndustries_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {            return res.json(JSON.parse(cachedData));          }
      }

      const { count, rows } = await MsmeLoanSupportedIndustries.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
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
      const cacheKey = `msmeLoanSupportedIndustry_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(industry), 3600);
      res.json({ success: true, data: industry });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = industry.icon;

      if (req.file) {
        updateData.icon = `/uploads/msme-loan-supported-industries/${req.file.filename}`;
        Logger.info(`Updated icon for MsmeLoanSupportedIndustry ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await MsmeLoanSupportedIndustriesController.deleteFile(oldIcon);
        }
      }

      await industry.update(updateData);

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      await CacheService.invalidate(`msmeLoanSupportedIndustry_${id}`);
      await CacheService.invalidatePattern("msmeLoanSupportedIndustries_page_*");
      res.json({ success: true, data: industry, message: "MSME Loan Supported Industry updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const industry = await MsmeLoanSupportedIndustries.findByPk(id);
      if (!industry) {
        throw new CustomError("MSME Loan Supported Industry not found", 404);
      }

      const oldIcon = industry.icon;
      await industry.destroy();

      if (oldIcon) {
        await MsmeLoanSupportedIndustriesController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("msmeLoanSupportedIndustries");
      await CacheService.invalidate(`msmeLoanSupportedIndustry_${id}`);
      await CacheService.invalidatePattern("msmeLoanSupportedIndustries_page_*");
      res.json({ success: true, message: "MSME Loan Supported Industry deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeLoanSupportedIndustriesController;
