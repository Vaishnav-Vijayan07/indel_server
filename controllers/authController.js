const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { models } = require("../models/index");
const { Op } = require("sequelize");
const CustomError = require("../utils/customError");
const { sendPasswordResetEmail } = require("../services/emailService");

const User = models.User;
const Otp = models.Otp;

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName, phone, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || "user",
        isActive: true, // Default value, can be omitted since schema sets it
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
      const isEmail = identifier.includes('@');
      
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

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userWithoutPassword = { ...user.toJSON() };
      delete userWithoutPassword.password;

      res.json({ success: true, data: { token, user: userWithoutPassword } });
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
        attributes: ["id", "email", "firstName", "lastName"]
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
        where: { email }
      });

      // Save new OTP
      await Otp.create({
        email,
        otp,
        expires_at: expiresAt
      });

      // Send password reset email
      await sendPasswordResetEmail(email, otp, user.firstName || 'User');

      res.json({
        success: true,
        message: "Password reset OTP sent to your email address"
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
        order: [['created_at', 'DESC']]
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
        attributes: ["id", "email"]
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
        message: "Password has been reset successfully"
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
        attributes: ["id", "email", "firstName", "lastName"]
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
        where: { email }
      });

      // Save new OTP
      await Otp.create({
        email,
        otp,
        expires_at: expiresAt
      });

      // Send password reset email
      await sendPasswordResetEmail(email, otp, user.firstName || 'User');

      res.json({
        success: true,
        message: "New OTP sent to your email address"
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = AuthController;