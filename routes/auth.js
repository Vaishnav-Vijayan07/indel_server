const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { 
  validateLogin, 
  validateRegister, 
  validatePasswordResetRequest, 
  validatePasswordReset, 
  validateResendOtp 
} = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.post("/register", validateRegister, validateMiddleware, AuthController.register);
router.post("/login", validateLogin, validateMiddleware, AuthController.login);

// Password reset routes
router.post("/request-password-reset", validatePasswordResetRequest, validateMiddleware, AuthController.requestPasswordReset);
router.post("/verify-otp-reset-password", validatePasswordReset, validateMiddleware, AuthController.verifyOtpAndResetPassword);
router.post("/resend-otp", validateResendOtp, validateMiddleware, AuthController.resendOtp);


module.exports = router;