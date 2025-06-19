const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { check } = require("express-validator");
const FloatButtonsController = require("../../controllers/floatButtons/buttonsController");

const validateFloatButtons = [
  check("link").optional().notEmpty().withMessage("Link must be a valid URL"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];
const validateFloatButtonsUpdate = [
  check("link").notEmpty().withMessage("Link must be a valid URL"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const upload = createUploadMiddleware("float-buttons");
const uploadField = upload.single("icon");

router.get("/", FloatButtonsController.getAll);
router.get("/:id", FloatButtonsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateFloatButtonsUpdate, validateMiddleware, FloatButtonsController.create);
router.put("/:id", uploadField, validateFloatButtons, validateMiddleware, FloatButtonsController.update);
router.delete("/:id", FloatButtonsController.delete);

module.exports = router;
