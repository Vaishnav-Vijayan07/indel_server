const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateAboutPageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutPageContentController = require("../../controllers/about/aboutHomeContentController");

const upload = createUploadMiddleware("about-page-content");
const uploadFields = upload.fields([
  { name: "investors_image_1", maxCount: 1 },
  { name: "investors_image_2", maxCount: 1 },
]);

router.get("/", AboutPageContentController.get);
router.put(
  "/",
  authMiddleware(["admin"]),
  uploadFields,
  validateAboutPageContentUpdate,
  validateMiddleware,
  AboutPageContentController.update
);

module.exports = router;
