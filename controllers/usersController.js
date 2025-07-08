const { models } = require("../models/index");
const CustomError = require("../utils/customError");
const Logger = require("../services/logger");
const CacheService = require("../services/cacheService"); // optional
const User = models.User;

class UsersController {
  // Create a new user
  static async create(req, res, next) {
    try {
      const userData = { ...req.body };
      const user = await User.create(userData);
      Logger.info(`User created: ${user.username}`);
      res.status(201).json({ success: true, data: user, message: "User created successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  static async getAll(req, res, next) {
    try {
      // Optional: implement caching
      const cacheKey = "Users_all";
      const cachedData = await CacheService.get?.(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const users = await User.findAll({ order: [["id", "ASC"]] });
      await CacheService.set?.(cacheKey, JSON.stringify(users), 3600);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `User_${id}`;
      const cachedData = await CacheService.get?.(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const user = await User.findByPk(id);
      if (!user) throw new CustomError("User not found", 404);
      await CacheService.set?.(cacheKey, JSON.stringify(user), 3600);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Update user by ID
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) throw new CustomError("User not found", 404);
      await user.update(req.body);
      await CacheService.invalidate?.("Users_all");
      res.json({ success: true, data: user, message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Delete user by ID
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) throw new CustomError("User not found", 404);
      await user.destroy();
      await CacheService.invalidate?.("Users_all");
      res.json({ success: true, message: "User deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
