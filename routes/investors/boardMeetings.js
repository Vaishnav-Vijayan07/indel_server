const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const BoardMeetingsController = require("../../controllers/investors/boardMeetingsController");
const { validateBoardMeetings, validateBoardMeetingsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/board-meetings");
const uploadFields = upload.fields([
  { name: "intimation_document", maxCount: 1 },
  { name: "outcome_document", maxCount: 1 },
]);

router.get("/", BoardMeetingsController.getAll);
router.get("/:id", BoardMeetingsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateBoardMeetings, validateMiddleware, BoardMeetingsController.create);
router.put("/:id", uploadFields, validateBoardMeetingsUpdate, validateMiddleware, BoardMeetingsController.update);
router.delete("/:id", BoardMeetingsController.delete);

module.exports = router;