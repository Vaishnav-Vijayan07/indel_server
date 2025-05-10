const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ServicesController = require("../../controllers/services/servicesController");
const { validateIndelValue, validateIndelValueUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("services");
const uploadField = upload.single("image");

router.get("/", ServicesController.getAll);
router.get("/:id", ServicesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateIndelValue, validateMiddleware, ServicesController.create);
router.put("/:id", uploadField, validateIndelValueUpdate, validateMiddleware, ServicesController.update);
router.delete("/:id", ServicesController.delete);

module.exports = router;
