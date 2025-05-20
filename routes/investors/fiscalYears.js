const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const FiscalYearsController = require("../../controllers/investors/fiscalYearController");
const { validateFiscalYear, validateFiscalYearUpdate } = require("../../utils/validator");

router.get("/", FiscalYearsController.getAll);
router.get("/:id", FiscalYearsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFiscalYear, validateMiddleware, FiscalYearsController.create);
router.put("/:id", validateFiscalYearUpdate, validateMiddleware, FiscalYearsController.update);
router.delete("/:id", FiscalYearsController.delete);

module.exports = router;
