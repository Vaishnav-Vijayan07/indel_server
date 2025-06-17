const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeLoanSupportedIndustries, validateMsmeLoanSupportedIndustriesUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const loanAgainstPropertySupportedIndustriesController = require("../../controllers/loanAgainstProperty/supportedIndustriesController");

const upload = createUploadMiddleware("loan-against-property-supported-industries");
const uploadField = upload.single("icon");

router.get("/", loanAgainstPropertySupportedIndustriesController.getAll);
router.get("/:id", loanAgainstPropertySupportedIndustriesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeLoanSupportedIndustries, validateMiddleware, loanAgainstPropertySupportedIndustriesController.create);
router.put("/:id", uploadField, validateMsmeLoanSupportedIndustriesUpdate, validateMiddleware, loanAgainstPropertySupportedIndustriesController.update);
router.delete("/:id", loanAgainstPropertySupportedIndustriesController.delete);

module.exports = router;
