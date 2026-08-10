const { models } = require("../models/index");
const { Op } = require("sequelize");
const CustomError = require("../utils/customError");
const Logger = require("../services/logger");
const CacheService = require("../services/cacheService"); // optional
const User = models.User;
const bcrypt = require("bcrypt");
const logger = require("../services/logger");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // your actual mail server
  port: 587, // try 587 for TLS, or 465 for SSL
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // e.g. careers@indelmoney.co.in
    pass: process.env.EMAIL_PASS, // your actual password
  },
  tls: {
    ciphers: "SSLv3", // as per client team (but STARTTLS handles most cases)
  },
});

async function sendEmailChangeNotification(oldEmail, newEmail, firstName) {
  if (!oldEmail) return; // nothing to notify if there was no prior email on record

  await transporter.sendMail({
    from: `"Indel Money" <${process.env.EMAIL_USER}>`,
    to: oldEmail,
    subject: "Your account email address has changed",
    html: `
      <p>Hi ${firstName || "there"},</p>
      <p>Your account email was changed from <b>${oldEmail}</b> to <b>${newEmail}</b>.</p>
      <p>If you did not request this change, please contact support immediately.</p>
    `,
  });
}

class UsersController {
  static async create(req, res, next) {
    try {
      const { username, password, email, firstName, lastName, phone, isActive, role } = req.body;

      if (role == "admin" && req.user.role !== "admin") {
        throw new CustomError("Forbidden: Only admins can create admin accounts", 403);
      }

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

      if (role == "admin") {
        const isAdmin = await User.findOne({ where: { role: "admin" } });
        if (isAdmin) {
          throw new CustomError("Admin account already exists", 400);
        }
      }

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
      const { page, limit, search } = req.query;

      // Legacy path - no pagination params (backward compatible)
      if (!page && !limit) {
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
        return res.json({ success: true, data: users });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.username = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `Users_all_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await User.findAndCountAll({
        where: whereConditions,
        order: [["id", "ASC"]],
        attributes: { exclude: ["password"] },
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
        await CacheService.set?.(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
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

      // ── Email change detection ────────────────────────────────────────────
      const oldEmail = targetUser.email;
      const emailChanged = updateData.email && updateData.email !== oldEmail;

      if (emailChanged) {
        // Prevent taking over an email already claimed by another account
        const existing = await User.findOne({ where: { email: updateData.email } });
        if (existing) {
          throw new CustomError("Email already in use", 400);
        }
      }

      await targetUser.update(updateData);
      await CacheService.invalidate?.("Users_all");
      await CacheService.invalidate?.(`User_${id}`);

      // ── Notify both old and new addresses, fire-and-forget ────────────────
      // Don't let email delivery issues break the actual update response.
      if (emailChanged) {
        sendEmailChangeNotification(oldEmail, updateData.email, targetUser.firstName).catch((err) =>
          logger.error(`Failed to send email-change notification for user ${id}: ${err.message}`),
        );
      }

      const { password, ...safeUser } = targetUser.toJSON();
      res.json({ success: true, data: safeUser, message: "User updated successfully" });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError" && error.original?.constraint === "unique_admin_role") {
        return res.status(400).json({ success: false, message: "An admin account already exists." });
      }
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
