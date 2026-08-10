const { Op, fn, col, where } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Roles = models.CareerRoles;

class RolesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };


    // Check for existing role (case-insensitive)
    const existRole = await Roles.findOne({
      where: where(
        fn("LOWER", col("role_name")),
        updateData.role_name.toLowerCase()
      ),
    });

    if (existRole) {
      throw new CustomError(`${updateData?.role_name} is already exists`, 400);
    }

      const role = await Roles.create(updateData);

      await CacheService.invalidate("roles");
       await CacheService.invalidate("webCareerPage");
      await CacheService.invalidatePattern("roles_page_*");
      res.status(201).json({ success: true, data: role, message: "Role created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "roles";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const roles = await Roles.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(roles), 3600);
        return res.json({ success: true, data: roles });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.role_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `roles_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Roles.findAndCountAll({
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
      const cacheKey = `role_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const role = await Roles.findByPk(id);
      if (!role) {
        throw new CustomError("Role not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(role), 3600);
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const role = await Roles.findByPk(id);
      if (!role) {
        throw new CustomError("Role not found", 404);
      }

      const updateData = { ...req.body };

      await role.update(updateData);

      await CacheService.invalidate("roles");
       await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`role_${id}`);
      await CacheService.invalidatePattern("roles_page_*");
      res.json({ success: true, data: role, message: "Role updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const role = await Roles.findByPk(id);
      if (!role) {
        throw new CustomError("Role not found", 404);
      }

      await role.destroy();

      await CacheService.invalidate("roles");
       await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`role_${id}`);
      await CacheService.invalidatePattern("roles_page_*");
      res.json({ success: true, message: "Role deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolesController;
