const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const SocialMediaIconsController = require("../../controllers/footer/iconsController");
const { validateSocialMediaIcons, validateSocialMediaIconsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("social-media-icons");
const uploadField = upload.single("icon");

router.get("/", SocialMediaIconsController.getAll);
router.get("/:id", SocialMediaIconsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateSocialMediaIcons, validateMiddleware, SocialMediaIconsController.create);
router.put("/:id", uploadField, validateSocialMediaIconsUpdate, validateMiddleware, SocialMediaIconsController.update);
router.delete("/:id", SocialMediaIconsController.delete);

module.exports = router;
