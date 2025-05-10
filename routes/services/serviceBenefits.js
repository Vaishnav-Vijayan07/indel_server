const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ServiceBenefitsController = require("../../controllers/services/serviceBenefitController");
const { validateServiceBenefits, validateServiceBenefitsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("service-benefits");
const uploadField = upload.single("icon");

router.get("/", ServiceBenefitsController.getAll);
router.get("/:id", ServiceBenefitsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateServiceBenefits, validateMiddleware, ServiceBenefitsController.create);
router.put("/:id", uploadField, validateServiceBenefitsUpdate, validateMiddleware, ServiceBenefitsController.update);
router.delete("/:id", ServiceBenefitsController.delete);

module.exports = router;
