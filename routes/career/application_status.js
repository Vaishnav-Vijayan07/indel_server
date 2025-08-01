const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ApplicationStatusesController = require("../../controllers/career/applicationStatusController");
const { validateApplicationStatuses, validateApplicationStatusesUpdate } = require("../../utils/validator");

router.get("/", ApplicationStatusesController.getAll);
router.get("/:id", ApplicationStatusesController.getById);

// Admin-only routes
router.use(authMiddleware(["admin"]));
router.post("/", validateApplicationStatuses, validateMiddleware, ApplicationStatusesController.create);
router.put("/:id", validateApplicationStatusesUpdate, validateMiddleware, ApplicationStatusesController.update);
router.delete("/:id", authMiddleware(["admin"]), ApplicationStatusesController.delete);

module.exports = router;