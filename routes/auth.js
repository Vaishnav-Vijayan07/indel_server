const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { validateLogin, validateRegister } = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.post("/register", validateRegister, validateMiddleware, AuthController.register);
router.post("/login", validateLogin, validateMiddleware, AuthController.login);

module.exports = router;