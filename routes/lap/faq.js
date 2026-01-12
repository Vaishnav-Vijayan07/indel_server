const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const LapFaqsController = require("../../controllers/lap/faqContoller");

router.get("/", LapFaqsController.getAll);
router.get("/:id", LapFaqsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, LapFaqsController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, LapFaqsController.update);
router.delete("/:id", LapFaqsController.delete);

module.exports = router;
