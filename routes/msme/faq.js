const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const MsmeLoanFaqsController = require("../../controllers/msme/faqController");

router.get("/", MsmeLoanFaqsController.getAll);
router.get("/:id", MsmeLoanFaqsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, MsmeLoanFaqsController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, MsmeLoanFaqsController.update);
router.delete("/:id", MsmeLoanFaqsController.delete);

module.exports = router;
