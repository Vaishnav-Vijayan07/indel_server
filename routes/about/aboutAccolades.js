const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const {
  validateAboutAccolades,
  validateAboutAccoladesUpdate,
} = require("../../utils/validator");
const AboutAccoladesController = require("../../controllers/about/aboutAccoladesController");

const upload = createUploadMiddleware("about-accolades");
const uploadField = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "highlight_image", maxCount: 1 },
]);

router.get("/", AboutAccoladesController.getAll);
router.get("/:id", AboutAccoladesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutAccolades, validateMiddleware, AboutAccoladesController.create);
router.put("/:id", uploadField, validateAboutAccoladesUpdate, validateMiddleware, AboutAccoladesController.update);
router.delete("/:id", AboutAccoladesController.delete);

module.exports = router;
