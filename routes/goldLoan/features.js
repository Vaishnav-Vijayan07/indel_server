const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateGoldLoanFeature, validateGoldLoanFeatureUpdate } = require("../../utils/validator");
const GoldLoanFeaturesController = require("../../controllers/goldloan/featuresController");

const upload = createUploadMiddleware("gold-loan-features");
const uploadField = upload.single("icon");

router.get("/", GoldLoanFeaturesController.getAll);
router.get("/:id", GoldLoanFeaturesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateGoldLoanFeature, validateMiddleware, GoldLoanFeaturesController.create);
router.put("/:id", uploadField, validateGoldLoanFeatureUpdate, validateMiddleware, GoldLoanFeaturesController.update);
router.put("/center/:id", validateGoldLoanFeatureUpdate, validateMiddleware, GoldLoanFeaturesController.updateItemCenterStatus);
router.delete("/:id", GoldLoanFeaturesController.delete);

module.exports = router;
