const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const GoldLoanFaqsController = require("../../controllers/goldloan/faqController");

router.get("/", GoldLoanFaqsController.getAll);
router.get("/:id", GoldLoanFaqsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, GoldLoanFaqsController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, GoldLoanFaqsController.update);
router.delete("/:id", GoldLoanFaqsController.delete);

module.exports = router;
