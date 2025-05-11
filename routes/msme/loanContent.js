const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const MsmeLoanContentController = require("../../controllers/msme/loanContentController");
const { validateMsmeLoanContentUpdate } = require("../../utils/validator");

router.get("/", MsmeLoanContentController.getAll);

router.use(authMiddleware(["admin"]));
router.put("/", validateMsmeLoanContentUpdate, validateMiddleware, MsmeLoanContentController.update);

module.exports = router;
