const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const DebtPartnersContentController = require("../../controllers/debt/debtPartnersContentController");
const { validateDeptPartnersContentUpdate, validateDeptPartnersContent } = require("../../utils/validator");

router.get("/", validateDeptPartnersContent, DebtPartnersContentController.get);
router.put("/", authMiddleware(["admin"]), validateDeptPartnersContentUpdate, validateMiddleware, DebtPartnersContentController.update);

module.exports = router;
