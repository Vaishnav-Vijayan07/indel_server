const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const OtherIntimationsController = require("../../controllers/investors/otherIntimationsController");
const { validateOtherIntimations, validateOtherIntimationsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/other-intimations");
const uploadFields = upload.fields([
  { name: "record_date_document", maxCount: 1 },
  { name: "interest_payment_document", maxCount: 1 },
]);

router.get("/", OtherIntimationsController.getAll);
router.get("/:id", OtherIntimationsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateOtherIntimations, validateMiddleware, OtherIntimationsController.create);
router.put("/:id", uploadFields, validateOtherIntimationsUpdate, validateMiddleware, OtherIntimationsController.update);
router.delete("/:id", OtherIntimationsController.delete);

module.exports = router;
