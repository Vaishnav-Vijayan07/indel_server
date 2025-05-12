const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCareerBannersUpdate, validateCareerBanners } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CareerBannersController = require("../../controllers/career/bannerController");

const upload = createUploadMiddleware("career-banners");
const uploadField = upload.single("image");

router.get("/", CareerBannersController.getAll);
router.get("/:id", CareerBannersController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCareerBanners, validateMiddleware, CareerBannersController.create);
router.put("/:id", uploadField, validateCareerBannersUpdate, validateMiddleware, CareerBannersController.update);
router.delete("/:id", CareerBannersController.delete);

module.exports = router;
