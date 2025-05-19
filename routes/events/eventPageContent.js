const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const EventPageContentController = require("../../controllers/event/eventPageContentController");
const { validateEventPageContentItemUpdate } = require("../../utils/validator");

router.get("/", EventPageContentController.get);
router.put("/", authMiddleware(["admin"]), validateEventPageContentItemUpdate, validateMiddleware, EventPageContentController.update);

module.exports = router;