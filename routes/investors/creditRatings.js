const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CreditRatingsController = require("../../controllers/investors/creditsRatingsController");
const { validateCreditRatings, validateCreditRatingsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("credit-ratings");
const uploadField = upload.single("file");

router.get("/", CreditRatingsController.getAll);
router.get("/:id", CreditRatingsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCreditRatings, validateMiddleware, CreditRatingsController.create);
router.put("/:id", uploadField, validateCreditRatingsUpdate, validateMiddleware, CreditRatingsController.update);
router.delete("/:id", CreditRatingsController.delete);

module.exports = router;