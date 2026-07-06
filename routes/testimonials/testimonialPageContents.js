const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const TestimonialPageContentsController = require("../../controllers/testimonials/testimonialPageContentsController");
const { validateTestimonialPageContents } = require("../../utils/validator");

router.get("/", TestimonialPageContentsController.get);
router.put(
  "/",
  authMiddleware(["admin", "hr", "hr-executive", "manager"]),
  validateTestimonialPageContents,
  validateMiddleware,
  TestimonialPageContentsController.update,
);

module.exports = router;
