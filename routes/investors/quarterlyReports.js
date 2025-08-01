const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const QuarterlyReportsController = require("../../controllers/investors/quarterlyReports");
const { validateQuarterlyReports, validateQuarterlyReportsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("quarterly-reports");
const uploadField = upload.single("file");

router.get("/", QuarterlyReportsController.getAll);
router.get("/:id", QuarterlyReportsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateQuarterlyReports, validateMiddleware, QuarterlyReportsController.create);
router.put("/:id", uploadField, validateQuarterlyReportsUpdate, validateMiddleware, QuarterlyReportsController.update);
router.delete("/:id", QuarterlyReportsController.delete);

module.exports = router;