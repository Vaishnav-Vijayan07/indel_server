const { models } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");

const PolicyCategories = models.PolicyCategories;

class PolicyCategoryController {
  static async create(req, res, next) {
    try {
      const category = await PolicyCategories.create(req.body);
      await CacheService.invalidate("PolicyCategories");
      await CacheService.invalidate("ActivePolicyCategories");
      await CacheService.invalidate("webInvestorsPolicyCategories");
      await CacheService.invalidatePattern("PolicyCategories_page_*");
      res.status(201).json({ success: true, data: category, message: "Policy category created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "PolicyCategories";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const categories = await PolicyCategories.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(categories), 3600);
        return res.json({ success: true, data: categories });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `PolicyCategories_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await PolicyCategories.findAndCountAll({
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

   static async getActiveAll(req, res, next) {
    try {
      const cacheKey = "ActivePolicyCategories";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const categories = await PolicyCategories.findAll({
        order: [["order", "ASC"]],
        where:{
          is_active: true
        }
      });

      await CacheService.set(cacheKey, JSON.stringify(categories), 3600);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `policyCategory_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const category = await PolicyCategories.findByPk(id);

      if (!category) {
        throw new CustomError("Policy category not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(category), 3600);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const category = await PolicyCategories.findByPk(id);

      if (!category) {
        throw new CustomError("Policy category not found", 404);
      }

      await category.update(req.body);
      await CacheService.invalidate("PolicyCategories");
      await CacheService.invalidate(`policyCategory_${id}`);
      await CacheService.invalidate("ActivePolicyCategories");
      await CacheService.invalidate("webInvestorsPolicyCategories");
      await CacheService.invalidatePattern("PolicyCategories_page_*");
      Logger.info(`Policy category ${id} updated`);
      res.json({ success: true, data: category, message: "Policy category updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const category = await PolicyCategories.findByPk(id);

      if (!category) {
        throw new CustomError("Policy category not found", 404);
      }

      // Check if any policies exist under this category
      const policyCount = await models.Policies.count({
        where: { category_id: id }
      });

      if (policyCount > 0) {
        throw new CustomError("Cannot delete category because it has associated policies", 400);
      }

      await category.destroy();
      await CacheService.invalidate("PolicyCategories");
      await CacheService.invalidate(`policyCategory_${id}`);
      await CacheService.invalidate("ActivePolicyCategories");
      await CacheService.invalidate("webInvestorsPolicyCategories");
      await CacheService.invalidatePattern("PolicyCategories_page_*");
      Logger.info(`Policy category ${id} deleted`);
      res.json({ success: true, message: "Policy category deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PolicyCategoryController;
