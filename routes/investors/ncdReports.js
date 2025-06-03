const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const NcdReportsController = require("../../controllers/investors/ncdReportsController");
const { validateCorporateGovernance, validateCorporateGovernanceUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("ncd-reports");
const uploadField = upload.single("file");

router.get("/", NcdReportsController.getAll);
router.get("/:id", NcdReportsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCorporateGovernance, validateMiddleware, NcdReportsController.create);
router.put("/:id", uploadField, validateCorporateGovernanceUpdate, validateMiddleware, NcdReportsController.update);
router.delete("/:id", NcdReportsController.delete);

module.exports = router;