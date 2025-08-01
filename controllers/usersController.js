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

      // Manual validation
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }
      if (role && !["admin", "user", "hr", "manager", "hr_assistant"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
      // Optional: Validate email format
      if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        phone,
        isActive,
        role,
      };

      const user = await User.create(userData);
      // Invalidate cache if needed
      await CacheService.invalidate?.("Users_all");
      Logger.info(`User created: ${user.username}`);
      res.status(201).json({ success: true, data: user, message: "User created successfully" });
    } catch (error) {
      // Handle unique constraint errors gracefully
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ success: false, message: "Username or email already exists." });
      }
      // Handle validation errors
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      next(error);
    }
  }

  // Get all users
  // static async getAll(req, res, next) {
  //   try {
  //     // Optional: implement caching
  //     const cacheKey = "Users_all";
  //     const cachedData = await CacheService.get?.(cacheKey);
  //     if (cachedData) {
  //       return res.json({ success: true, data: JSON.parse(cachedData) });
  //     }
  //     const users = await User.findAll({ order: [["id", "ASC"]] });
  //     await CacheService.set?.(cacheKey, JSON.stringify(users), 3600);
  //     res.json({ success: true, data: users });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "Users_all";
      const cachedData = await CacheService.get?.(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const users = await User.findAll({ order: [["id", "ASC"]] });

      // Set password to null
      const usersWithoutPassword = users.map((user) => {
        const obj = typeof user.toJSON === "function" ? user.toJSON() : user;
        return { ...obj, password: null };
      });

      await CacheService.set?.(cacheKey, JSON.stringify(usersWithoutPassword), 3600);
      res.json({ success: true, data: usersWithoutPassword });
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
  // static async update(req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const user = await User.findByPk(id);
  //     if (!user) throw new CustomError("User not found", 404);
  //     await user.update(req.body);
  //     await CacheService.invalidate?.("Users_all");
  //     await CacheService.invalidate?.(`User_${id}`);
  //     res.json({ success: true, data: user, message: "User updated successfully" });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) throw new CustomError("User not found", 404);

      const updateData = { ...req.body };

      // If password is null, undefined, or empty string, remove it from updateData
      if (updateData.password === null || updateData.password === undefined || updateData.password === "") {
        delete updateData.password;
      } else if (updateData.password) {
        // If password is provided and not empty, hash it
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await user.update(updateData);
      await CacheService.invalidate?.("Users_all");
      await CacheService.invalidate?.(`User_${id}`);
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
      await CacheService.invalidate?.(`User_${id}`);
      res.json({ success: true, message: "User deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
