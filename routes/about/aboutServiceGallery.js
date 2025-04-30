const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateAboutLifeAtIndel, validateAboutLifeAtIndelUpdate } = require("../../utils/validator");
const AboutServiceGalleryController = require("../../controllers/about/aboutServiceGalleryController");

const upload = createUploadMiddleware("about-service-gallery");
const uploadField = upload.single("image")

router.get("/", AboutServiceGalleryController.getAll);
router.get("/:id", AboutServiceGalleryController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutLifeAtIndel, validateMiddleware, AboutServiceGalleryController.create);
router.put("/:id", uploadField, validateAboutLifeAtIndelUpdate, validateMiddleware, AboutServiceGalleryController.update);
router.delete("/:id", AboutServiceGalleryController.delete);

module.exports = router;
