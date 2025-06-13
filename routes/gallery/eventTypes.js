const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const EventTypesController = require("../../controllers/gallery/eventTypesController");
const { validateEventType, validateEventTypeUpdate } = require("../../utils/validator");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("event-types");
const uploadFields = upload.single("cover_image");

router.get("/", EventTypesController.getAll);
router.get("/:id", EventTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateEventType, validateMiddleware, EventTypesController.create);
router.put("/:id", uploadFields, validateEventTypeUpdate, validateMiddleware, EventTypesController.update);
router.delete("/:id", EventTypesController.delete);

module.exports = router;
