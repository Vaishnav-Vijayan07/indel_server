const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const {
  validateLogin,
  validateRegister,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateResendOtp,
  validateCurrentUserProfile,
  validateCurrentUserPassword,
} = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", validateRegister, validateMiddleware, AuthController.register);
router.post("/login", validateLogin, validateMiddleware, AuthController.login);

router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

// Password reset routes
router.post("/request-password-reset", validatePasswordResetRequest, validateMiddleware, AuthController.requestPasswordReset);
router.post("/verify-otp-reset-password", validatePasswordReset, validateMiddleware, AuthController.verifyOtpAndResetPassword);
router.post("/resend-otp", validateResendOtp, validateMiddleware, AuthController.resendOtp);

// User profile routes (authenticated)
router.get("/profile", authMiddleware(), AuthController.getCurrentUserProfile);
router.put("/profile", authMiddleware(), validateCurrentUserProfile, validateMiddleware, AuthController.updateCurrentUserProfile);
router.put("/change-password", authMiddleware(), validateCurrentUserPassword, validateMiddleware, AuthController.changeCurrentUserPassword);

module.exports = router;
