const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateHomeLoanStep, validateHomeLoanStepUpdate, validateHomeSmartDeals, validateHomeSmartDealsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const GoldLoanBannerFeaturesController = require("../../controllers/goldloan/bannerFeatures");

const upload = createUploadMiddleware("gold-loan-banner-features");
const uploadField = upload.single("icon");

router.get("/", GoldLoanBannerFeaturesController.getAll);
router.get("/:id", GoldLoanBannerFeaturesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateHomeSmartDeals, validateMiddleware, GoldLoanBannerFeaturesController.create);
router.put("/:id", uploadField, validateHomeSmartDealsUpdate, validateMiddleware, GoldLoanBannerFeaturesController.update);
router.delete("/:id", GoldLoanBannerFeaturesController.delete);

module.exports = router;
