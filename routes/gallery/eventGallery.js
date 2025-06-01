const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const EventGalleryController = require("../../controllers/gallery/eventGalleryController");
const { validateEventGallery, validateEventGalleryUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("event-gallery");
const uploadFields = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
]);

router.get("/", EventGalleryController.getAll);
router.get("/:id", EventGalleryController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateEventGallery, validateMiddleware, EventGalleryController.create);
router.put("/:id", uploadFields, validateEventGalleryUpdate, validateMiddleware, EventGalleryController.update);
router.delete("/:id", EventGalleryController.delete);

module.exports = router;