const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const AwardPageContentController = require("../../controllers/awards/awardPageContentController");
const { validateAwardPageContentItemUpdate } = require("../../utils/validator");

router.get("/", AwardPageContentController.get);
router.put("/", authMiddleware(["admin"]), validateAwardPageContentItemUpdate, validateMiddleware, AwardPageContentController.update);

module.exports = router;