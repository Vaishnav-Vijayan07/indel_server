const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateBlogPageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const BlogPageContentController = require("../../controllers/blog/contentController");

router.get("/", BlogPageContentController.get);
router.put("/", authMiddleware(["admin"]), validateBlogPageContentUpdate, validateMiddleware, BlogPageContentController.update);

module.exports = router;
