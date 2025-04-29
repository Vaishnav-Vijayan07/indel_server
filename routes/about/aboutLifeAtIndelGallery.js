const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutLifeAtIndelGalleryController = require("../../controllers/about/aboutLifeAtIndelGalleryController");
const { validateAboutLifeAtIndel, validateAboutLifeAtIndelUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("about-life-at-indel-gallery");
const uploadField = upload.single("image")

router.get("/", AboutLifeAtIndelGalleryController.getAll);
router.get("/:id", AboutLifeAtIndelGalleryController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutLifeAtIndel, validateMiddleware, AboutLifeAtIndelGalleryController.create);
router.put("/:id", uploadField, validateAboutLifeAtIndelUpdate, validateMiddleware, AboutLifeAtIndelGalleryController.update);
router.delete("/:id", AboutLifeAtIndelGalleryController.delete);

module.exports = router;
