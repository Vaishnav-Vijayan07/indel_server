const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CsrReportController = require("../../controllers/investors/csrReportController");
const { validateCsrReport, validateCsrReportUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/csr-reports");
const uploadField = upload.single("report");

router.get("/", CsrReportController.getAll);
router.get("/:id", CsrReportController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCsrReport, validateMiddleware, CsrReportController.create);
router.put("/:id", uploadField, validateCsrReportUpdate, validateMiddleware, CsrReportController.update);
router.delete("/:id", CsrReportController.delete);

module.exports = router;
