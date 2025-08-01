const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ServiceTypesController = require("../../controllers/serviceEnquiries/serviceTypes");
const { validateServiceType, validateServiceTypeUpdate } = require("../../utils/validator");

router.get("/", ServiceTypesController.getAll);
router.get("/:id", ServiceTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateServiceType, validateMiddleware, ServiceTypesController.create);
router.put("/:id", validateServiceTypeUpdate, validateMiddleware, ServiceTypesController.update);
router.delete("/:id", ServiceTypesController.delete);

module.exports = router;