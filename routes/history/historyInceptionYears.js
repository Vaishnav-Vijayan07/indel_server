const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const {
  validateHistoryInceptionsYears,
  validateHistoryInceptionsYearsUpdate,
} = require("../../utils/validator");
const HistoryInceptionYearsController = require("../../controllers/history/historyInceptionsYearsController");

const upload = createUploadMiddleware("history-inception-years");
const uploadField = upload.single("image");

router.get("/", HistoryInceptionYearsController.getAll);
router.get("/:id", HistoryInceptionYearsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateHistoryInceptionsYears, validateMiddleware, HistoryInceptionYearsController.create);
router.put("/:id", uploadField, validateHistoryInceptionsYearsUpdate, validateMiddleware, HistoryInceptionYearsController.update);
router.delete("/:id", HistoryInceptionYearsController.delete);

module.exports = router;
