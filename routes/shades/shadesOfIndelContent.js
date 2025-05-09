const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const {  generateStringValidators } = require("../../utils/validator");
const ShadesOfIndelContentController = require("../../controllers/shadesOfIndel/shadesOfIndelContentController");
const updateValidation = generateStringValidators(["page_title", "approach_title"], true);

router.get("/", ShadesOfIndelContentController.get);
router.put("/", authMiddleware(["admin"]), updateValidation, validateMiddleware, ShadesOfIndelContentController.update);

module.exports = router;
