const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ContactFaqController = require("../../controllers/contact/contactFaqController");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");

router.get("/", ContactFaqController.getAll);
router.get("/:id", ContactFaqController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, ContactFaqController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, ContactFaqController.update);
router.delete("/:id", ContactFaqController.delete);

module.exports = router;
