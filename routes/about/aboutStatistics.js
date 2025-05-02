const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutStatisticsController = require("../../controllers/about/aboutStatisticsController");
const { validateAboutStatsItem,validateAboutStatsItemUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("about-statistics");
const uploadField = upload.single("icon")

router.get("/", AboutStatisticsController.getAll);
router.get("/:id", AboutStatisticsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutStatsItem, validateMiddleware, AboutStatisticsController.create);
router.put("/:id", uploadField, validateAboutStatsItemUpdate, validateMiddleware, AboutStatisticsController.update);
router.delete("/:id", AboutStatisticsController.delete);

module.exports = router;
