const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const {  generateStringValidators } = require("../../utils/validator");
const IndelValueContentController = require("../../controllers/indelValues/indelValueContentController");

const updateValidation = generateStringValidators(["page_title", "approach_title"], true);

router.get("/", IndelValueContentController.get);
router.put("/", authMiddleware(["admin"]), updateValidation, validateMiddleware, IndelValueContentController.update);

module.exports = router;
