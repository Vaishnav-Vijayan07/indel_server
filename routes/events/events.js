const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const EventController = require("../../controllers/event/eventController");
const { validateEvent, validateEventUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("events");
const uploadField = upload.single("image");

router.get("/", EventController.getAll);
router.get("/:id", EventController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateEvent, validateMiddleware, EventController.create);
router.put("/:id", uploadField, validateEventUpdate, validateMiddleware, EventController.update);
router.delete("/:id", EventController.delete);

module.exports = router;