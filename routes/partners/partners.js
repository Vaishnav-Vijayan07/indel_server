const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const PartnersController = require("../../controllers/partners/partnersDataController");
const { check } = require("express-validator");

const validatePartnersUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("logo_alt").optional().notEmpty().withMessage("Logo Alt is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("partner_type_id").optional().isInt().withMessage("Partner ID must be an integer"),
];
const validatePartners = [
  check("title").notEmpty().withMessage("Title is required"),
  check("logo_alt").notEmpty().withMessage("Logo Alt is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("partner_type_id").isInt().withMessage("Partner ID must be an integer"),
];

const upload = createUploadMiddleware("partners");
const uploadField = upload.single("logo");

router.get("/", PartnersController.getAll);
router.get("/:id", PartnersController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validatePartners, validateMiddleware, PartnersController.create);
router.put("/:id", uploadField, validatePartnersUpdate, validateMiddleware, PartnersController.update);
router.delete("/:id", PartnersController.delete);

module.exports = router;
