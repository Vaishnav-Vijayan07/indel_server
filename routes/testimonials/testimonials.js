const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const TestimonialsController = require("../../controllers/testimonials/testimonialsController");
const { validateTestimonial, validateTestimonialUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/testimonials");
const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.get("/", TestimonialsController.getAll);
router.get("/:id", TestimonialsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateTestimonial, validateMiddleware, TestimonialsController.create);
router.put("/:id", uploadFields, validateTestimonialUpdate, validateMiddleware, TestimonialsController.update);
router.delete("/:id", TestimonialsController.delete);

module.exports = router;
