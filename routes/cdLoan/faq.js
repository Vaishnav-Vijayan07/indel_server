const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const CDLoanFaqsController = require("../../controllers/CD/faqController");

router.get("/", CDLoanFaqsController.getAll);
router.get("/:id", CDLoanFaqsController.getById);

router.use(authMiddleware(["admin", "hr", "hr-executive"]));
router.post("/", validateFaq, validateMiddleware, CDLoanFaqsController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, CDLoanFaqsController.update);
router.delete("/:id", CDLoanFaqsController.delete);

module.exports = router;
