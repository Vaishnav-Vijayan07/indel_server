const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateContactContentUpdate } = require("../../utils/validator");
const ContactContentController = require("../../controllers/contact/contactContentController");

const upload = createUploadMiddleware("contact-content");
const uploadFields = upload.single("contact_image");

router.get("/", ContactContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields,validateContactContentUpdate , validateMiddleware, ContactContentController.update);

module.exports = router;
