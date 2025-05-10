const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const GoldLoanSchemeController = require("../../controllers/goldloan/goldLoanSchemeController");
const { validateGoldLoanScheme, validateGoldLoanSchemeUpdate } = require("../../utils/validator");

router.get("/", GoldLoanSchemeController.getAll);
router.get("/:id", GoldLoanSchemeController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateGoldLoanScheme, validateMiddleware, GoldLoanSchemeController.create);
router.put("/:id", validateGoldLoanSchemeUpdate, validateMiddleware, GoldLoanSchemeController.update);
router.delete("/:id", GoldLoanSchemeController.delete);

module.exports = router;
