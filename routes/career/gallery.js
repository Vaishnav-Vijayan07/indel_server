const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCareerBannersUpdate, validateCareerBanners } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CareerGalleryController = require("../../controllers/career/galleryController");

const upload = createUploadMiddleware("career-gallery");
const uploadField = upload.single("image");

router.get("/", CareerGalleryController.getAll);
router.get("/:id", CareerGalleryController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCareerBanners, validateMiddleware, CareerGalleryController.create);
router.put("/:id", uploadField, validateCareerBannersUpdate, validateMiddleware, CareerGalleryController.update);
router.delete("/:id", CareerGalleryController.delete);

module.exports = router;
