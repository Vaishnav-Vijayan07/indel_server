const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Roles = models.CareerRoles;

class RolesController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const role = await Roles.create(updateData);

      await CacheService.invalidate("roles");
      res.status(201).json({ success: true, data: role, message: "Role created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "roles";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const roles = await Roles.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(roles), 3600);
      res.json({ success: true, data: roles });
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
      await CacheService.invalidate(`role_${id}`);
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
      await CacheService.invalidate(`role_${id}`);
      res.json({ success: true, message: "Role deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolesController;
