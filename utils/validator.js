const { check } = require("express-validator");

const validateAuth = [
  check("username").notEmpty().withMessage("Username is required"),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const validateHeroBanner = [
  check("title").notEmpty().withMessage("Title is required"),
  check("button_text").notEmpty().withMessage("Button text is required"),
  check("button_link").notEmpty().withMessage("Button link is required"),
  check("location").notEmpty().withMessage("Location is required"),
];

module.exports = { validateAuth, validateHeroBanner };
