const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { models } = require("../models/index");
const { Op } = require("sequelize");
const CustomError = require("../utils/customError");
const { sendPasswordResetEmail } = require("../services/emailService");
const { generateAccessToken, generateRefreshToken, hashToken } = require("../utils/tokenService");
const { formatDateTime, formatDuration } = require("../utils/logFormat");

const User = models.User;
const Otp = models.Otp;
const RefreshToken = models.RefreshToken;

const REFRESH_TOKEN_EXPIRY_MS = Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 30 * 24 * 60 * 60 * 1000;

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: REFRESH_TOKEN_EXPIRY_MS, // 30 days in ms
};

// Helper to clear the refresh cookie with matching options
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};

// Helper: create a new RefreshToken DB row and return the raw token
const issueRefreshToken = async (userId, req) => {
  const rawToken = generateRefreshToken();
  const tokenHash = hashToken(rawToken);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: req.headers["user-agent"] || null,
    ip: req.ip || null,
  });

  console.log(
    `[AUTH] Issued refresh token for user ${userId} at ${formatDateTime(now)} — valid for ${formatDuration(REFRESH_TOKEN_EXPIRY_MS)}, expires ${formatDateTime(expiresAt)}.`,
  );

  return rawToken;
};

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName, phone } = req.body;
      // SECURITY: role is ALWAYS forced to "user" on self-registration.
      // Privileged account creation (admin/hr/manager) must go through a
      // separate, authMiddleware()-gated, role-checked endpoint.
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: "user",
        isActive: true,
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { identifier, password } = req.body;

      // Check if identifier and password are provided
      if (!identifier) {
        throw new CustomError("Username or email is required", 400);
      }

      if (!password) {
        throw new CustomError("Password is required", 400);
      }

      // Determine if identifier is an email or username
      const isEmail = identifier.includes("@");

      // Build where condition for either username or email
      let whereCondition = {};
      if (isEmail) {
        // Search by email (case-insensitive)
        whereCondition = { email: { [Op.iLike]: identifier } };
      } else {
        // Search by username (exact match)
        whereCondition = { username: identifier };
      }

      const user = await User.findOne({
        attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "password", "isActive"],
        where: whereCondition,
      });

      if (!user) {
        throw new CustomError("Invalid credentials", 401);
      }

      if (!user.isActive) {
        throw new CustomError("Account is deactivated", 403);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new CustomError("Invalid credentials", 401);
      }

      // Issue short-lived access token (15 min)
      const token = generateAccessToken(user);

      // Issue rotated refresh token — stored hashed in DB, raw in httpOnly cookie
      const rawRefreshToken = await issueRefreshToken(user.id, req);
      res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, REFRESH_COOKIE_OPTIONS);

      const userWithoutPassword = { ...user.toJSON() };
      delete userWithoutPassword.password;

      // Response shape is unchanged: { success, data: { token, user } }
      // Frontend reads response.data.data.token — preserved as-is.
      res.json({ success: true, data: { token, user: userWithoutPassword } });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (!rawToken) {
        throw new CustomError("Refresh token missing", 401);
      }

      const incomingHash = hashToken(rawToken);

      // Look up the token row (regardless of revocation status — we need to
      // detect replayed rotated-out tokens for theft detection)
      const tokenRow = await RefreshToken.findOne({
        where: { tokenHash: incomingHash },
      });

      if (!tokenRow) {
        // Unknown token — could be forged or from a previous DB wipe
        clearRefreshCookie(res);
        throw new CustomError("Invalid refresh token", 401);
      }

      // ── Theft detection ─────────────────────────────────────────────────────
      // If the token has already been revoked it means a previously rotated-out
      // token is being replayed.  Revoke ALL active tokens for this user and
      // treat it as a possible session hijack.
      if (tokenRow.revokedAt !== null) {
        console.warn(
          `[AUTH ALARM] Possible token theft for user ${tokenRow.userId} at ${formatDateTime(new Date())} — a previously rotated-out refresh token was replayed (originally revoked ${formatDateTime(tokenRow.revokedAt)}). Revoking all active sessions for this user.`,
        );
        await RefreshToken.update(
          { revokedAt: new Date() },
          {
            where: {
              userId: tokenRow.userId,
              revokedAt: null,
            },
          },
        );
        clearRefreshCookie(res);
        throw new CustomError("Refresh token already used — possible token theft detected", 401);
      }

      // ── Expiry check ────────────────────────────────────────────────────────
      if (new Date() > tokenRow.expiresAt) {
        console.log(
          `[AUTH] Refresh token expired for user ${tokenRow.userId} — expired at ${formatDateTime(tokenRow.expiresAt)} (${formatDuration(new Date() - tokenRow.expiresAt)} ago). Revoking.`,
        );
        await tokenRow.update({ revokedAt: new Date() });
        clearRefreshCookie(res);
        throw new CustomError("Refresh token expired", 401);
      }

      // ── Token is valid — rotate ──────────────────────────────────────────────
      const user = await User.findOne({
        where: { id: tokenRow.userId },
        attributes: ["id", "username", "email", "role", "isActive"],
      });

      if (!user || !user.isActive) {
        clearRefreshCookie(res);
        throw new CustomError("User not found or deactivated", 401);
      }

      // Issue new refresh token
      const newRawToken = generateRefreshToken();
      const newTokenHash = hashToken(newRawToken);
      const now = new Date();
      const nextExpiry = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS);

      // Revoke old token, record what replaced it
      await tokenRow.update({
        revokedAt: now,
        replacedByTokenHash: newTokenHash,
      });

      // Persist new token row
      await RefreshToken.create({
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: nextExpiry,
        userAgent: req.headers["user-agent"] || null,
        ip: req.ip || null,
      });

      console.log(
        `[AUTH] Refresh token rotated for user ${user.id} at ${formatDateTime(now)} — old token revoked, new token expires ${formatDateTime(nextExpiry)} (${formatDuration(REFRESH_TOKEN_EXPIRY_MS)} from now).`,
      );

      // Set new cookie
      res.cookie(REFRESH_COOKIE_NAME, newRawToken, REFRESH_COOKIE_OPTIONS);

      // Issue new access token
      const token = generateAccessToken(user);

      res.json({ success: true, data: { token } });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // This route must NOT be behind authMiddleware() — the whole point of
      // logout is that it should work even when the access token has expired.
      // We identify the session solely via the refresh cookie.
      const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (rawToken) {
        const tokenHash = hashToken(rawToken);
        const now = new Date();
        // Revoke the matching row if it exists and is still active
        const [updatedCount] = await RefreshToken.update(
          { revokedAt: now },
          {
            where: {
              tokenHash,
              revokedAt: null,
            },
          },
        );

        if (updatedCount > 0) {
          console.log(`[AUTH] Refresh token revoked via logout at ${formatDateTime(now)}.`);
        }
      }

      clearRefreshCookie(res);
      res.json({ success: true, message: "Logged out" });
    } catch (error) {
      next(error);
    }
  }

  static async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError("Email is required", 400);
      }

      // Check if user exists
      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email", "firstName", "lastName"],
      });

      if (!user) {
        throw new CustomError("No account found with this email address", 404);
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete any existing OTPs for this email
      await Otp.destroy({
        where: { email },
      });

      // Save new OTP
      await Otp.create({
        email,
        otp,
        expires_at: expiresAt,
      });

      // Send password reset email
      await sendPasswordResetEmail(email, otp, user.firstName || "User");

      res.json({
        success: true,
        message: "Password reset OTP sent to your email address",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtpAndResetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        throw new CustomError("Email, OTP, and new password are required", 400);
      }

      // Validate password strength
      if (newPassword.length < 6) {
        throw new CustomError("Password must be at least 6 characters long", 400);
      }

      // Find the OTP record
      const otpRecord = await Otp.findOne({
        where: { email, otp },
        order: [["created_at", "DESC"]],
      });

      if (!otpRecord) {
        throw new CustomError("Invalid OTP", 400);
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expires_at) {
        await Otp.destroy({ where: { id: otpRecord.id } });
        throw new CustomError("OTP has expired. Please request a new one", 400);
      }

      // Find user
      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email"],
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await user.update({ password: hashedPassword });

      // Delete the used OTP
      await Otp.destroy({ where: { id: otpRecord.id } });

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError("Email is required", 400);
      }

      // Check if user exists
      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email", "firstName", "lastName"],
      });

      if (!user) {
        throw new CustomError("No account found with this email address", 404);
      }

      // Generate new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete any existing OTPs for this email
      await Otp.destroy({
        where: { email },
      });

      // Save new OTP
      await Otp.create({
        email,
        otp,
        expires_at: expiresAt,
      });

      // Send password reset email
      await sendPasswordResetEmail(email, otp, user.firstName || "User");

      res.json({
        success: true,
        message: "New OTP sent to your email address",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile (from token)
  static async getCurrentUserProfile(req, res, next) {
    try {
      // Get user ID from token (set by auth middleware)
      const userId = req.user.id;

      if (!userId) {
        throw new CustomError("User not authenticated", 401);
      }

      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "isActive", "createdAt", "updatedAt"],
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update current user profile (from token)
  static async updateCurrentUserProfile(req, res, next) {
    try {
      // Get user ID from token
      const userId = req.user.id;
      const { username, email, firstName, lastName, phone } = req.body;

      if (!userId) {
        throw new CustomError("User not authenticated", 401);
      }

      // Check if user exists
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "isActive"],
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Prepare update data (only allow updating profile fields, not role or isActive)
      const updateData = {};

      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;

      // Check for duplicate username if username is being updated
      if (username && username !== user.username) {
        const existingUser = await User.findOne({
          where: { username: username },
        });
        if (existingUser) {
          throw new CustomError("Username already exists", 400);
        }
      }

      // Check for duplicate email if email is being updated
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: email },
        });
        if (existingUser) {
          throw new CustomError("Email already exists", 400);
        }
      }

      // Update user
      await user.update(updateData);

      // Get updated user data
      const updatedUser = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "isActive", "createdAt", "updatedAt"],
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  // Change current user password (from token)
  static async changeCurrentUserPassword(req, res, next) {
    try {
      // Get user ID from token
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!userId) {
        throw new CustomError("User not authenticated", 401);
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new CustomError("Current password, new password and confirm password are required", 400);
      }

      if (newPassword !== confirmPassword) {
        throw new CustomError("New passwords do not match", 400);
      }

      if (newPassword.length < 6) {
        throw new CustomError("New password must be at least 6 characters long", 400);
      }

      // Check if user exists
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "email", "password"],
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Verify current password
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw new CustomError("Current password is incorrect", 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await user.update({ password: hashedPassword });

      res.json({
        success: true,
        message: "Password has been changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
