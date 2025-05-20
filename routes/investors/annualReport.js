const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AnnualReportController = require("../../controllers/investors/annualReportController");
const { validateAnnualReport, validateAnnualReportUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("annual-reports");
const uploadField = upload.single("file");

router.get("/", AnnualReportController.getAll);
router.get("/:id", AnnualReportController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAnnualReport, validateMiddleware, AnnualReportController.create);
router.put("/:id", uploadField, validateAnnualReportUpdate, validateMiddleware, AnnualReportController.update);
router.delete("/:id", AnnualReportController.delete);

module.exports = router;