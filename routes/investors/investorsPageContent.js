const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const InvestorsPageContentController = require("../../controllers/investors/investorsPageContentController");
const { validateInvestorsPageContentItemUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors");
const uploadField = upload.single("disclosure_file");

router.get("/", InvestorsPageContentController.get);
router.put(
  "/",
  authMiddleware(["admin"]),
  uploadField,
  validateInvestorsPageContentItemUpdate,
  validateMiddleware,
  InvestorsPageContentController.update
);

module.exports = router;
