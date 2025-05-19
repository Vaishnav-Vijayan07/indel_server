const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const NewsPageContentController = require("../../controllers/news/newsPageContentController");
const { validateNewsPageContentItemUpdate } = require("../../utils/validator");

router.get("/", NewsPageContentController.get);
router.put("/", authMiddleware(["admin"]), validateNewsPageContentItemUpdate, validateMiddleware, NewsPageContentController.update);

module.exports = router;