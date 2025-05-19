const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const EventTypesController = require("../../controllers/gallery/eventTypesController");
const { validateEventType, validateEventTypeUpdate } = require("../../utils/validator");

router.get("/", EventTypesController.getAll);
router.get("/:id", EventTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateEventType, validateMiddleware, EventTypesController.create);
router.put("/:id", validateEventTypeUpdate, validateMiddleware, EventTypesController.update);
router.delete("/:id", EventTypesController.delete);

module.exports = router;