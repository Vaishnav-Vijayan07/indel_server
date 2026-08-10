const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CdLoanBenefits = models.CdLoanBenefits;

class CdLoanBenefitsController {
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
        updateData.icon = `/uploads/cd-loan-benefits/${req.file.filename}`;
        Logger.info(`Uploaded icon for CdLoanBenefit: ${updateData.icon}`);
      }

      const product = await CdLoanBenefits.create(updateData);

      await CacheService.invalidate("CdLoanBenefits");
      await CacheService.invalidate("webCDLoan");
      res.status(201).json({ success: true, data: product, message: "CD Loan Benefit created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "CdLoanBenefits";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const products = await CdLoanBenefits.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(products), 3600);
        return res.json({ success: true, data: products });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `CdLoanBenefits_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {            return res.json(JSON.parse(cachedData));          }
      }

      const { count, rows } = await CdLoanBenefits.findAndCountAll({
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
      const cacheKey = `cdLoanBenfit_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const product = await CdLoanBenefits.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Benefit not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(product), 3600);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const product = await CdLoanBenefits.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Benefit not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = product.icon;

      if (req.file) {
        updateData.icon = `/uploads/cd-loan-benefits/${req.file.filename}`;
        Logger.info(`Updated icon for CdLoanBenefit ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await CdLoanBenefitsController.deleteFile(oldIcon);
        }
      }

      await product.update(updateData);

      await CacheService.invalidate("CdLoanBenefits");
      await CacheService.invalidate("webCDLoan");
      await CacheService.invalidate(`cdLoanBenfit_${id}`);
      res.json({ success: true, data: product, message: "CD Loan Benefit updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const product = await CdLoanBenefits.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Benefit not found", 404);
      }

      const oldIcon = product.icon;
      await product.destroy();

      if (oldIcon) {
        await CdLoanBenefitsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("CdLoanBenefits");
      await CacheService.invalidate("webCDLoan");
      await CacheService.invalidate(`cdLoanBenfit_${id}`);
      res.json({ success: true, message: "CD Loan Benefit deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CdLoanBenefitsController;
