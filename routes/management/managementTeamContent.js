const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ManagementTeamContentController = require("../../controllers/management/managementTeamContentController");
const { validateMngmtTeamContentItemUpdate } = require("../../utils/validator");

router.get("/", ManagementTeamContentController.get);
router.put(
  "/",
  authMiddleware(["admin", "hr", "hr-executive", "manager"]),
  validateMngmtTeamContentItemUpdate,
  validateMiddleware,
  ManagementTeamContentController.update,
);

module.exports = router;
