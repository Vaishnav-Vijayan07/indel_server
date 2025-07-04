const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const GoldLoanContentController = require("../../controllers/goldloan/goldloanContentController");
const { validateGoldLoanContentUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("gold-loan-content");
const uploadFields = upload.fields([
  { name: "banner_image", maxCount: 1 },
  { name: "steps_image", maxCount: 1 },
  { name: "hassle_free_image", maxCount: 1 },
  { name: "banner_image_mobile", maxCount: 1 },
]);

router.get("/", GoldLoanContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateGoldLoanContentUpdate, validateMiddleware, GoldLoanContentController.update);

module.exports = router;
