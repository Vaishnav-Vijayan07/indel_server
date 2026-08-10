const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Policies = models.Policies;

class PoliciesController {
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
        throw new CustomError("File is required", 400);
      }
      data.file = `/uploads/investors/policies/${req.file.filename}`;
      Logger.info(`Uploaded file for Policies: ${data.file}`);

      const policy = await Policies.create(data);
      await CacheService.invalidate("Policies");
      res.status(201).json({ success: true, data: policy, message: "Policy created" });
    } catch (error) {
      if (req.file) {
        await PoliciesController.deleteFile(`/uploads/investors/policies/${req.file.filename}`);
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const include = [{ model: models.PolicyCategories, as: "policyCategory", attributes: ["id", "title"] }];

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Policies";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const policies = await Policies.findAll({ include, order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(policies), 3600);
        return res.json({ success: true, data: policies });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `Policies_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await Policies.findAndCountAll({
        where: whereConditions,
        include,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
        distinct: true,
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
      const cacheKey = `policy_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const policy = await Policies.findByPk(id);
      if (!policy) {
        throw new CustomError("Policy not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(policy), 3600);
      res.json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await Policies.findByPk(id);
      if (!policy) {
        throw new CustomError("Policy not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = policy.file;

      if (req.file) {
        updateData.file = `/uploads/investors/policies/${req.file.filename}`;
        Logger.info(`Updated file for Policy ID ${id}: ${updateData.file}`);
        if (oldFile) {
          await PoliciesController.deleteFile(oldFile);
        }
      }

      await policy.update(updateData);
      await CacheService.invalidate("Policies");
      await CacheService.invalidate(`policy_${id}`);
      res.json({ success: true, data: policy, message: "Policy updated" });
    } catch (error) {
      if (req.file) {
        await PoliciesController.deleteFile(`/uploads/investors/policies/${req.file.filename}`);
      }
      next(error);
    }
  }
  
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await Policies.findByPk(id);
      if (!policy) {
        throw new CustomError("Policy not found", 404);
      }

      const oldFile = policy.file;
      await policy.destroy();

      if (oldFile) {
        await PoliciesController.deleteFile(oldFile);
      }

      await CacheService.invalidate("Policies");
      await CacheService.invalidate(`policy_${id}`);
      res.json({ success: true, message: "Policy deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PoliciesController;
