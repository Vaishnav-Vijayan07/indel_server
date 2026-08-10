const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LoanTypes = models.MsmeloanTypes;

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
        updateData.image = `/uploads/loan-types/${req.file.filename}`;
        Logger.info(`Uploaded image for LoanType: ${updateData.image}`);
      }

      const loanType = await LoanTypes.create(updateData);

      await CacheService.invalidate("loanTypes");
      await CacheService.invalidatePattern("loanTypes_page_*");
      res.status(201).json({ success: true, data: loanType, message: "Loan Type created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "loanTypes";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const loanTypes = await LoanTypes.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(loanTypes), 3600);
        return res.json({ success: true, data: loanTypes });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search (search on title, sub_title, description)
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search.trim()}%` } },
          { sub_title: { [Op.iLike]: `%${search.trim()}%` } },
          { description: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `loanTypes_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {            return res.json(JSON.parse(cachedData));          }
      }

      const { count, rows } = await LoanTypes.findAndCountAll({
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
      const cacheKey = `loanType_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const loanType = await LoanTypes.findByPk(id);
      if (!loanType) {
        throw new CustomError("Loan Type not found", 404);
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
        throw new CustomError("Loan Type not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = loanType.image;

      if (req.file) {
        updateData.image = `/uploads/loan-types/${req.file.filename}`;
        Logger.info(`Updated image for LoanType ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await LoanTypesController.deleteFile(oldImage);
        }
      }

      await loanType.update(updateData);

      await CacheService.invalidate("loanTypes");
      await CacheService.invalidate(`loanType_${id}`);
      await CacheService.invalidatePattern("loanTypes_page_*");
      res.json({ success: true, data: loanType, message: "Loan Type updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const loanType = await LoanTypes.findByPk(id);
      if (!loanType) {
        throw new CustomError("Loan Type not found", 404);
      }

      const oldImage = loanType.image;
      await loanType.destroy();

      if (oldImage) {
        await LoanTypesController.deleteFile(oldImage);
      }

      await CacheService.invalidate("loanTypes");
      await CacheService.invalidate(`loanType_${id}`);
      await CacheService.invalidatePattern("loanTypes_page_*");
      res.json({ success: true, message: "Loan Type deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoanTypesController;
