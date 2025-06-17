const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const LoanContentController = require("../../controllers/loanAgainstProperty/loanContentController");
const { validateLoanAgainstPropertyContentUpdate } = require("../../utils/validator");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("loan-against-property-content");
const uploadFields = upload.single("why_loan_against_property_image");

router.get("/", LoanContentController.getAll);

router.use(authMiddleware(["admin"]));
router.put("/", uploadFields, validateLoanAgainstPropertyContentUpdate, validateMiddleware, LoanContentController.update);

module.exports = router;
