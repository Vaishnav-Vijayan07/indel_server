const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const BranchLocatorPageContentsController = require("../../controllers/branch/branchLocatorPageContentsController");
const { validateBranchLocatorPageContents } = require("../../utils/validator");

router.get("/", BranchLocatorPageContentsController.get);
router.put(
  "/",
  authMiddleware(["admin"]),
  validateBranchLocatorPageContents,
  validateMiddleware,
  BranchLocatorPageContentsController.update
);

module.exports = router;
