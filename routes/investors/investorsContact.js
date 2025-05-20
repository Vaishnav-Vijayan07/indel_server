const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const InvestorsContactController = require("../../controllers/investors/investorsContactController");
const { validateInvestorsContact, validateInvestorsContactUpdate } = require("../../utils/validator");

router.get("/", InvestorsContactController.getAll);
router.get("/:id", InvestorsContactController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateInvestorsContact, validateMiddleware, InvestorsContactController.create);
router.put("/:id", validateInvestorsContactUpdate, validateMiddleware, InvestorsContactController.update);
router.delete("/:id", InvestorsContactController.delete);

module.exports = router;