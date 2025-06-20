const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const LoanAgainstPropertyFaqController = require("../../controllers/loanAgainstProperty/faqController");

router.get("/", LoanAgainstPropertyFaqController.getAll);
router.get("/:id", LoanAgainstPropertyFaqController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, LoanAgainstPropertyFaqController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, LoanAgainstPropertyFaqController.update);
router.delete("/:id", LoanAgainstPropertyFaqController.delete);

module.exports = router;
