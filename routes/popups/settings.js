const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const PopupSettingsController = require("../../controllers/popups/settingsController");
const { validatePopupSettingsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("popup-settings");
const uploadFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner_popup_image", maxCount: 1 },
]);

router.get("/", PopupSettingsController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validatePopupSettingsUpdate, validateMiddleware, PopupSettingsController.update);

module.exports = router;
