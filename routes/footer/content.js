const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateFooterContentUpdate } = require("../../utils/validator");
const FooterContentController = require("../../controllers/footer/contentController");

const upload = createUploadMiddleware("footer-content");
const uploadFields = upload.single("logo");

router.get("/", FooterContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateFooterContentUpdate, validateMiddleware, FooterContentController.update);

module.exports = router;
