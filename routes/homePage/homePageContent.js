const express = require("express");
const router = express.Router();
const HomePageContentController = require("../../controllers/homePage/homePageContentController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateHomePageContent, validateHomePageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("home-page-content");
const uploadFields = upload.fields([
  { name: "gold_rate_icon", maxCount: 1 },
  { name: "about_image", maxCount: 1 },
  { name: "investment_image", maxCount: 1 },
  { name: "mobile_app_image", maxCount: 1 },
]);

router.get("/", HomePageContentController.get);
router.put(
  "/",
  authMiddleware(["admin"]),
  uploadFields,
  validateHomePageContentUpdate,
  validateMiddleware,
  HomePageContentController.update
);

module.exports = router;
