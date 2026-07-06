const { models } = require("../models/index");
const CustomError = require("../utils/customError");
const Logger = require("../services/logger");
const CacheService = require("../services/cacheService"); // optional
const User = models.User;
const bcrypt = require("bcrypt");

class UsersController {
  static async create(req, res, next) {
    try {
      const { username, password, email, firstName, lastName, phone, isActive, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }
      if (role && !["admin", "user", "hr", "manager", "hr_assistant"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
      if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
      }

      // Manager cannot create an admin account
      if (req.user.role === "manager" && role === "admin") {
        throw new CustomError("Forbidden: managers cannot create admin accounts", 403);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        phone,
        isActive,
        role,
      });

      await CacheService.invalidate?.("Users_all");
      Logger.info(`User created: ${user.username}`);

      const { password: _pw, ...safeUser } = user.toJSON();
      res.status(201).json({ success: true, data: safeUser, message: "User created successfully" });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ success: false, message: "Username or email already exists." });
      }
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "Users_all";
      const cachedData = await CacheService.get?.(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const users = await User.findAll({
        order: [["id", "ASC"]],
        attributes: { exclude: ["password"] },
      });

      await CacheService.set?.(cacheKey, JSON.stringify(users), 3600);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `User_${id}`;
      const cachedData = await CacheService.get?.(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const user = await User.findByPk(id, { attributes: { exclude: ["password"] } });
      if (!user) throw new CustomError("User not found", 404);
      await CacheService.set?.(cacheKey, JSON.stringify(user), 3600);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const targetUser = await User.findByPk(id);
      if (!targetUser) throw new CustomError("User not found", 404);

      const isSelf = String(req.user.id) === String(id);
      const isAdmin = req.user.role === "admin";
      const isManager = req.user.role === "manager";

      // Manager can never touch an admin's record, even their own profile
      if (isManager && targetUser.role === "admin" && !isSelf) {
        throw new CustomError("Forbidden", 403);
      }
      if (!isSelf && !isAdmin && !isManager) {
        throw new CustomError("Forbidden", 403);
      }

      // Basic allowlist — email included for now, will be revisited separately
      const BASE_FIELDS = ["firstName", "lastName", "phone", "email"];
      const ADMIN_ONLY_FIELDS = ["role", "isActive"];
      const allowed = isAdmin ? [...BASE_FIELDS, ...ADMIN_ONLY_FIELDS] : BASE_FIELDS;

      const updateData = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }

      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 10);
      }

      await targetUser.update(updateData);
      await CacheService.invalidate?.("Users_all");
      await CacheService.invalidate?.(`User_${id}`);

      const { password, ...safeUser } = targetUser.toJSON();
      res.json({ success: true, data: safeUser, message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const targetUser = await User.findByPk(id);
      if (!targetUser) throw new CustomError("User not found", 404);

      if (req.user.role === "manager" && targetUser.role === "admin") {
        throw new CustomError("Forbidden", 403);
      }

      await targetUser.destroy();
      await CacheService.invalidate?.("Users_all");
      await CacheService.invalidate?.(`User_${id}`);
      res.json({ success: true, message: "User deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
