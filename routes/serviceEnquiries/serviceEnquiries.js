const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ServiceEnquiriesController = require("../../controllers/serviceEnquiries/serviceEnquiries");
const { validateServiceEnquiry, validateServiceEnquiryUpdate } = require("../../utils/validator");

router.get("/", ServiceEnquiriesController.getAll);
router.get("/:id", ServiceEnquiriesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateServiceEnquiry, validateMiddleware, ServiceEnquiriesController.create);
router.put("/:id", validateServiceEnquiryUpdate, validateMiddleware, ServiceEnquiriesController.update);
router.delete("/:id", ServiceEnquiriesController.delete);

module.exports = router;
