const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateMngmtTeamContentItemUpdate } = require("../../utils/validator");
const DirectorContentController = require("../../controllers/directors/contentController");

router.get("/", DirectorContentController.get);
router.put("/", authMiddleware(["admin"]), validateMngmtTeamContentItemUpdate, validateMiddleware, DirectorContentController.update);

module.exports = router;
