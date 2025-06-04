const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const IndelCaresContentController = require("../../controllers/indelCare/contentController");
const { validateEventPageContentItemUpdate } = require("../../utils/validator");

router.get("/", IndelCaresContentController.get);
router.put("/", authMiddleware(["admin"]), validateEventPageContentItemUpdate, validateMiddleware, IndelCaresContentController.update);

module.exports = router;