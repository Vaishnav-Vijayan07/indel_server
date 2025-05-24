const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const InvestorsPageContentController = require("../../controllers/investors/investorsPageContentController");
const { validateInvestorsPageContentItemUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors");
const uploadField = upload.fields([
  {  name: "disclosure_file", maxCount: 1 },
  {  name: "csr_policy_doc", maxCount: 1 },

]);

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
