const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateCdLoanContentUpdate } = require("../../utils/validator");
const LAPContentController = require("../../controllers/lap/contentController");

const upload = createUploadMiddleware("lap-content");
const uploadFields = upload.fields([
  { name: "covered_products_section_image", maxCount: 1 },
  { name: "eligibility_criteria_icon", maxCount: 1 },
  { name: "feature_image", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.get("/", LAPContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateCdLoanContentUpdate, validateMiddleware, LAPContentController.update);

module.exports = router;
