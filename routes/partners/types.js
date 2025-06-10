const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const PartnersTypesController = require("../../controllers/partners/partnersController");
const { check } = require("express-validator");

const validatePartnersTypesUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validatePartnersTypes = [
  check("title").notEmpty().withMessage("Title is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

router.get("/", PartnersTypesController.getAll);
router.get("/:id", PartnersTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validatePartnersTypes, validateMiddleware, PartnersTypesController.create);
router.put("/:id", validatePartnersTypesUpdate, validateMiddleware, PartnersTypesController.update);
router.delete("/:id", PartnersTypesController.delete);

module.exports = router;
