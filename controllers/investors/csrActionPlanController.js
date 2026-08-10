const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CsrActionPlan = models.CsrActionPlan;

class CsrActionPlanController {
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
      if (!req.file) {
        throw new CustomError("Report document is required", 400);
      }
      data.report = `/uploads/investors/csr-action-plans/${req.file.filename}`;
      Logger.info(`Uploaded file for CSR Action Plan: ${data.report}`);

      const csrActionPlan = await CsrActionPlan.create(data);
      await CacheService.invalidate("CsrActionPlan");
      await CacheService.invalidate("webCsrDetails");
      res.status(201).json({ success: true, data: csrActionPlan, message: "CSR Action Plan created" });
    } catch (error) {
      if (req.file) {
        await CsrActionPlanController.deleteFile(`/uploads/investors/csr-action-plans/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // Legacy path (no pagination params) — backward compatible
      if (!page && !limit) {
        const cacheKey = "CsrActionPlan";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const csrActionPlans = await CsrActionPlan.findAll({
          include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
          order: [[{ model: models.FiscalYears, as: "fiscalYear" }, "fiscal_year", "DESC"]],
        });
        await CacheService.set(cacheKey, JSON.stringify(csrActionPlans), 3600);
        return res.json({ success: true, data: csrActionPlans });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // No title column on this model; search falls back to the report file path.
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.report = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `CsrActionPlan_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await CsrActionPlan.findAndCountAll({
        where: whereConditions,
        include: [{ model: models.FiscalYears, as: "fiscalYear", attributes: ["id", "fiscal_year"] }],
        order: [[{ model: models.FiscalYears, as: "fiscalYear" }, "fiscal_year", "DESC"]],
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
      const cacheKey = `csrActionPlan_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csrActionPlan = await CsrActionPlan.findByPk(id);
      if (!csrActionPlan) {
        throw new CustomError("CSR Action Plan not found", 404);
      }


      await CacheService.set(cacheKey, JSON.stringify(csrActionPlan), 3600);
      res.json({ success: true, data: csrActionPlan });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const csrActionPlan = await CsrActionPlan.findByPk(id);
      if (!csrActionPlan) {
        throw new CustomError("CSR Action Plan not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = csrActionPlan.report;

      if (req.file) {
        updateData.report = `/uploads/investors/csr-action-plans/${req.file.filename}`;
        Logger.info(`Updated file for CSR Action Plan ID ${id}: ${updateData.report}`);
        if (oldFile) {
          await CsrActionPlanController.deleteFile(oldFile);
        }
      }

      await csrActionPlan.update(updateData);
      await CacheService.invalidate("CsrActionPlan");
      await CacheService.invalidate("webCsrDetails");
      await CacheService.invalidate(`csrActionPlan_${id}`);
      res.json({ success: true, data: csrActionPlan, message: "CSR Action Plan updated" });
    } catch (error) {
      if (req.file) {
        await CsrActionPlanController.deleteFile(`/uploads/investors/csr-action-plans/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const csrActionPlan = await CsrActionPlan.findByPk(id);
      if (!csrActionPlan) {
        throw new CustomError("CSR Action Plan not found", 404);
      }

      const oldFile = csrActionPlan.report;
      await csrActionPlan.destroy();

      if (oldFile) {
        await CsrActionPlanController.deleteFile(oldFile);
      }

      await CacheService.invalidate("CsrActionPlan");
      await CacheService.invalidate("webCsrDetails");
      await CacheService.invalidate(`csrActionPlan_${id}`);
      res.json({ success: true, message: "CSR Action Plan deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrActionPlanController;
