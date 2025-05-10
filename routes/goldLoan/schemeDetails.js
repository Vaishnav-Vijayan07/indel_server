const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateSchemeDetails, validateSchemeDetailsUpdate } = require("../../utils/validator");
const GoldLoanSchemeDetailsController = require("../../controllers/goldloan/schemeDetailsController");

router.get("/", GoldLoanSchemeDetailsController.getAll);
router.get("/:id", GoldLoanSchemeDetailsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateSchemeDetails, validateMiddleware, GoldLoanSchemeDetailsController.create);
router.put("/:id", validateSchemeDetailsUpdate, validateMiddleware, GoldLoanSchemeDetailsController.update);
router.delete("/:id", GoldLoanSchemeDetailsController.delete);

module.exports = router;
