const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const DifferentShadesController = require("../../controllers/shadesOfIndel/differentShadesController");
const { validateDifferentShadesValue, validateDifferentShadesValueUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("different-shades");
const uploadField = upload.fields([
  { name: "banner_image", maxCount: 1 },
  { name: "brand_icon", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "second_image", maxCount: 1 },
]);

router.get("/", DifferentShadesController.getAll);
router.get("/:id", DifferentShadesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateDifferentShadesValue, validateMiddleware, DifferentShadesController.create);
router.put("/:id", uploadField, validateDifferentShadesValueUpdate, validateMiddleware, DifferentShadesController.update);
router.delete("/:id", DifferentShadesController.delete);

module.exports = router;
