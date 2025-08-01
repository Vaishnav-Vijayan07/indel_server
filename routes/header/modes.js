const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validatePaymentModes, validatePaymentModesUpdate } = require("../../utils/validator");
const PaymentModesController = require("../../controllers/header/paymentModesController");

router.get("/", PaymentModesController.getAll);
router.get("/:id", PaymentModesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validatePaymentModes, validateMiddleware, PaymentModesController.create);
router.put("/:id", validatePaymentModesUpdate, validateMiddleware, PaymentModesController.update);
router.delete("/:id", PaymentModesController.delete);

module.exports = router;
