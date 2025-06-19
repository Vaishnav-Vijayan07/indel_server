const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { generateStringValidators } = require("../../utils/validator");
const IndelValueContentController = require("../../controllers/indelValues/indelValueContentController");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const updateValidation = generateStringValidators(["page_title", "approach_title"], true);
const upload = createUploadMiddleware("indel-value-content");
const uploadFields = upload.single("banner_image");

router.get("/", IndelValueContentController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, updateValidation, validateMiddleware, IndelValueContentController.update);

module.exports = router;
