const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCdLoanProducts, validateCdLoanProductsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CdLoanProductsController = require("../../controllers/CD/loanProductsController");

const upload = createUploadMiddleware("cd-loan-products");
const uploadField = upload.single("icon");

router.get("/", CdLoanProductsController.getAll);
router.get("/:id", CdLoanProductsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCdLoanProducts, validateMiddleware, CdLoanProductsController.create);
router.put("/:id", uploadField, validateCdLoanProductsUpdate, validateMiddleware, CdLoanProductsController.update);
router.delete("/:id", CdLoanProductsController.delete);

module.exports = router;
