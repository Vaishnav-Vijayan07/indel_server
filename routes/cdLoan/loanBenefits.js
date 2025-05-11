const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCdLoanProducts, validateCdLoanProductsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CdLoanBenefitsController = require("../../controllers/CD/loanBenefitsController");

const upload = createUploadMiddleware("cd-loan-benefits");
const uploadField = upload.single("icon");

router.get("/", CdLoanBenefitsController.getAll);
router.get("/:id", CdLoanBenefitsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCdLoanProducts, validateMiddleware, CdLoanBenefitsController.create);
router.put("/:id", uploadField, validateCdLoanProductsUpdate, validateMiddleware, CdLoanBenefitsController.update);
router.delete("/:id", CdLoanBenefitsController.delete);

module.exports = router;
