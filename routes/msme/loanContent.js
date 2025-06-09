const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const MsmeLoanContentController = require("../../controllers/msme/loanContentController");
const { validateMsmeLoanContentUpdate } = require("../../utils/validator");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("msme-loan-content");
const uploadFields = upload.single("why_msme_loan_image");

router.get("/", MsmeLoanContentController.getAll);

router.use(authMiddleware(["admin"]));
router.put("/", uploadFields, validateMsmeLoanContentUpdate, validateMiddleware, MsmeLoanContentController.update);

module.exports = router;
