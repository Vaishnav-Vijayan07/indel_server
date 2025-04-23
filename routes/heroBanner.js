const express = require("express");
const router = express.Router();
const HeroBannerController = require("../controllers/heroBannerController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateHeroBanner } = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");
const createUploadMiddleware = require("../middlewares/multerMiddleware");

const upload = createUploadMiddleware("banner");

router.get("/", HeroBannerController.getAll);
router.get("/:id", HeroBannerController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", upload.single("image"), validateHeroBanner, validateMiddleware, HeroBannerController.create);
router.put("/:id", upload.single("image"), validateHeroBanner, validateMiddleware, HeroBannerController.update);
router.delete("/:id", HeroBannerController.delete);

module.exports = router;
