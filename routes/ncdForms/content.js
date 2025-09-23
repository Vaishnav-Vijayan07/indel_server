const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateNCDPageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const   NcdContentController = require("../../controllers/NCD/contentController");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("ncd-forms");
const uploadField = upload.fields([
  { name: "banner_image", maxCount: 1 },
  { name: "second_banner_image", maxCount: 1 },
]);


router.get("/", NcdContentController.get);
router.put("/", uploadField, validateNCDPageContentUpdate, validateMiddleware, NcdContentController.update);

module.exports = router;
