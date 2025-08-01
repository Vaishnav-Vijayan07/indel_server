const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const HeaderContentsController = require("../../controllers/header/contentController");
const { validateHeaderContentsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("header-contents");
const uploadFields = upload.fields([
  { name: "apple_dowload_icon", maxCount: 1 },
  { name: "andrioid_download_icon", maxCount: 1 },
  { name: "andrioid_download_icon_mobile", maxCount: 1 },
  { name: "apple_download_icon_mobile", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

router.get("/", HeaderContentsController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateHeaderContentsUpdate, validateMiddleware, HeaderContentsController.update);

module.exports = router;
