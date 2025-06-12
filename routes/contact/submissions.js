const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ContactSubmissionsController = require("../../controllers/contact/submissionsController");
const { check } = require("express-validator");

const validateContactSubmissions = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("phone").notEmpty().withMessage("Phone number is required"),
];

router.post("/", validateContactSubmissions, validateMiddleware, ContactSubmissionsController.create);
router.get("/", authMiddleware(["admin"]), ContactSubmissionsController.getAll);

module.exports = router;
