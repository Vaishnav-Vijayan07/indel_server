const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const InvestorsContactController = require("../../controllers/investors/investorsContactController");
const { validateInvestorsContact, validateInvestorsContactUpdate } = require("../../utils/validator");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("investors/investors-contacts");
const uploadField = upload.single("file");

router.get("/", InvestorsContactController.getAll);
router.get("/:id", InvestorsContactController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateInvestorsContact, validateMiddleware, InvestorsContactController.create);
router.put("/:id", uploadField, validateInvestorsContactUpdate, validateMiddleware, InvestorsContactController.update);
router.delete("/:id", InvestorsContactController.delete);

module.exports = router;
