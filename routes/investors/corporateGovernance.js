const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCorporateGovernance, validateCorporateGovernanceUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CorporateGovernanceController = require("../../controllers/investors/corporateGovernanceController");

const upload = createUploadMiddleware("corporate-governance");
const uploadField = upload.single("file");

router.get("/", CorporateGovernanceController.getAll);
router.get("/:id", CorporateGovernanceController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCorporateGovernance, validateMiddleware, CorporateGovernanceController.create);
router.put("/:id", uploadField, validateCorporateGovernanceUpdate, validateMiddleware, CorporateGovernanceController.update);
router.delete("/:id", CorporateGovernanceController.delete);

module.exports = router;