const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutQuickLinksController = require("../../controllers/about/aboutQuickLinks");
const { validateAboutQuickLinks, validateAboutQuickLinksUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("about-quick-links");
const uploadField = upload.single("image")

router.get("/", AboutQuickLinksController.getAll);
router.get("/:id", AboutQuickLinksController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutQuickLinks, validateMiddleware, AboutQuickLinksController.create);
router.put("/:id", uploadField, validateAboutQuickLinksUpdate, validateMiddleware, AboutQuickLinksController.update);
router.delete("/:id", AboutQuickLinksController.delete);

module.exports = router;
