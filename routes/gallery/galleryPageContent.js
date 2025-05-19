const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const GalleryPageContentController = require("../../controllers/gallery/galleryPageContentController");
const { validateGalleryPageContentItemUpdate } = require("../../utils/validator");

router.get("/", GalleryPageContentController.get);
router.put("/", authMiddleware(["admin"]), validateGalleryPageContentItemUpdate, validateMiddleware, GalleryPageContentController.update);

module.exports = router;