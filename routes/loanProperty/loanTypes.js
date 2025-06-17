const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const LoanTypesController = require("../../controllers/loanAgainstProperty/loanTypesController");
const { validateLoanTypesUpdate, validateLoanTypes } = require("../../utils/validator");

const upload = createUploadMiddleware("loan-against-property-types");
const uploadField = upload.single("image");

router.get("/", LoanTypesController.getAll);
router.get("/:id", LoanTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateLoanTypes, validateMiddleware, LoanTypesController.create);
router.put("/:id", uploadField, validateLoanTypesUpdate, validateMiddleware, LoanTypesController.update);
router.delete("/:id", LoanTypesController.delete);

module.exports = router;
