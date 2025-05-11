const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeTargetedAudience, validateMsmeTargetedAudienceUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const MsmeTargetedAudienceController = require("../../controllers/msme/targetAudienceController");

const upload = createUploadMiddleware("msme-targeted-audience");
const uploadField = upload.single("image");

router.get("/", MsmeTargetedAudienceController.getAll);
router.get("/:id", MsmeTargetedAudienceController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeTargetedAudience, validateMiddleware, MsmeTargetedAudienceController.create);
router.put("/:id", uploadField, validateMsmeTargetedAudienceUpdate, validateMiddleware, MsmeTargetedAudienceController.update);
router.delete("/:id", MsmeTargetedAudienceController.delete);

module.exports = router;
