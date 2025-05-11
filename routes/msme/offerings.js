const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateMsmeOfferings, validateMsmeOfferingsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const MsmeOfferingsController = require("../../controllers/msme/offeringsController");

const upload = createUploadMiddleware("msme-offerings");
const uploadField = upload.single("icon");

router.get("/", MsmeOfferingsController.getAll);
router.get("/:id", MsmeOfferingsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateMsmeOfferings, validateMiddleware, MsmeOfferingsController.create);
router.put("/:id", uploadField, validateMsmeOfferingsUpdate, validateMiddleware, MsmeOfferingsController.update);
router.delete("/:id", MsmeOfferingsController.delete);

module.exports = router;
