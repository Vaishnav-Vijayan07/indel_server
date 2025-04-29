const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateAboutBanner, validateAboutBannerUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutBannerController = require("../../controllers/about/aboutBannerController");

const upload = createUploadMiddleware("about-banners");
const uploadField = upload.single("image")

router.get("/", AboutBannerController.getAll);
router.get("/:id", AboutBannerController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutBanner, validateMiddleware, AboutBannerController.create);
router.put("/:id", uploadField, validateAboutBannerUpdate, validateMiddleware, AboutBannerController.update);
router.delete("/:id", AboutBannerController.delete);

module.exports = router;
