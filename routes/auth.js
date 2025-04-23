const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { validateAuth } = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.post("/register", validateAuth, validateMiddleware, AuthController.register);
router.post("/login", validateAuth, validateMiddleware, AuthController.login);

module.exports = router;