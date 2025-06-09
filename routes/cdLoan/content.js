const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CdLoanContentController = require("../../controllers/CD/contentController");
const { validateCdLoanContentUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("cd-content");
const uploadFields = upload.fields([
  { name: "covered_products_section_image", maxCount: 1 },
  { name: "eligibility_criteria_icon", maxCount: 1 },
  { name: "feature_image", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.get("/", CdLoanContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateCdLoanContentUpdate, validateMiddleware, CdLoanContentController.update);

module.exports = router;
