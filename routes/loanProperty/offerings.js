const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeOfferings, validateMsmeOfferingsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const loanAgainstPropertyOfferingsController = require("../../controllers/loanAgainstProperty/offeringsController");

const upload = createUploadMiddleware("loan-against-property-offerings");
const uploadField = upload.single("icon");

router.get("/", loanAgainstPropertyOfferingsController.getAll);
router.get("/:id", loanAgainstPropertyOfferingsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeOfferings, validateMiddleware, loanAgainstPropertyOfferingsController.create);
router.put("/:id", uploadField, validateMsmeOfferingsUpdate, validateMiddleware, loanAgainstPropertyOfferingsController.update);
router.delete("/:id", loanAgainstPropertyOfferingsController.delete);

module.exports = router;
