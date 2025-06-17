const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeTargetedAudience, validateMsmeTargetedAudienceUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const loanAgainstPropertyTargetedAudienceController = require("../../controllers/loanAgainstProperty/targetAudienceController");

const upload = createUploadMiddleware("loan-against-property-targeted-audience");
const uploadField = upload.single("image");

router.get("/", loanAgainstPropertyTargetedAudienceController.getAll);
router.get("/:id", loanAgainstPropertyTargetedAudienceController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeTargetedAudience, validateMiddleware, loanAgainstPropertyTargetedAudienceController.create);
router.put("/:id", uploadField, validateMsmeTargetedAudienceUpdate, validateMiddleware, loanAgainstPropertyTargetedAudienceController.update);
router.delete("/:id", loanAgainstPropertyTargetedAudienceController.delete);

module.exports = router;
