const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const HistoryContentController = require("../../controllers/history/historyContentController");
const { validateHistoryPageContent, validateHistoryPageContentUpdate } = require("../../utils/validator");

router.get("/", validateHistoryPageContent, HistoryContentController.get);
router.put("/", authMiddleware(["admin"]), validateHistoryPageContentUpdate, validateMiddleware, HistoryContentController.update);

module.exports = router;
