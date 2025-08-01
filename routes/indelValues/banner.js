const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateAboutBanner, validateAboutBannerUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const ValuesBannerMobileController = require("../../controllers/indelValues/bannerController");

const upload = createUploadMiddleware("value-banners");
const uploadField = upload.single("image");

router.get("/", ValuesBannerMobileController.getAll);
router.get("/:id", ValuesBannerMobileController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutBanner, validateMiddleware, ValuesBannerMobileController.create);
router.put("/:id", uploadField, validateAboutBannerUpdate, validateMiddleware, ValuesBannerMobileController.update);
router.delete("/:id", ValuesBannerMobileController.delete);

module.exports = router;
