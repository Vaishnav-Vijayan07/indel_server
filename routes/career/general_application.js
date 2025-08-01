const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const GeneralApplicationsController = require("../../controllers/career/generalApplicationController");
const { validateGeneralApplications, validateGeneralApplicationsUpdate } = require("../../utils/validator");

// Routes
router.get("/", GeneralApplicationsController.getAll);
router.get("/:id", GeneralApplicationsController.getById);

// Admin-only routes
router.use(authMiddleware(["admin"]));
router.post("/", validateGeneralApplications, validateMiddleware, GeneralApplicationsController.create);
router.put("/:id", validateGeneralApplicationsUpdate, validateMiddleware, GeneralApplicationsController.update);
router.delete("/:id", authMiddleware(["admin"]), GeneralApplicationsController.delete);

module.exports = router;
