const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const {
  validateHistoryImages,
  validateHistoryImagesUpdate,
} = require("../../utils/validator");
const HistoryImagesController = require("../../controllers/history/historyImagesController");

const upload = createUploadMiddleware("history-images");
const uploadField = upload.single("image");

router.get("/", HistoryImagesController.getAll);
router.get("/:id", HistoryImagesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateHistoryImages, validateMiddleware, HistoryImagesController.create);
router.put("/:id", uploadField, validateHistoryImagesUpdate, validateMiddleware, HistoryImagesController.update);
router.delete("/:id", HistoryImagesController.delete);

module.exports = router;
