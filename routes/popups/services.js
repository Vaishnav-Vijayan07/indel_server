const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const PopupServicesController = require("../../controllers/popups/servicesController");
const { validatePopupServices, validatePopupServicesUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("popup-services");
const uploadField = upload.single("image");

router.get("/", PopupServicesController.getAll);
router.get("/:id", PopupServicesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validatePopupServices, validateMiddleware, PopupServicesController.create);
router.put("/:id", uploadField, validatePopupServicesUpdate, validateMiddleware, PopupServicesController.update);
router.delete("/:id", PopupServicesController.delete);

module.exports = router;
