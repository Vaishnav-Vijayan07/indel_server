const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeLoanSupportedIndustries, validateMsmeLoanSupportedIndustriesUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const MsmeLoanSupportedIndustriesController = require("../../controllers/msme/supportedIndustriesController");

const upload = createUploadMiddleware("msme-loan-supported-industries");
const uploadField = upload.single("icon");

router.get("/", MsmeLoanSupportedIndustriesController.getAll);
router.get("/:id", MsmeLoanSupportedIndustriesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeLoanSupportedIndustries, validateMiddleware, MsmeLoanSupportedIndustriesController.create);
router.put("/:id", uploadField, validateMsmeLoanSupportedIndustriesUpdate, validateMiddleware, MsmeLoanSupportedIndustriesController.update);
router.delete("/:id", MsmeLoanSupportedIndustriesController.delete);

module.exports = router;
