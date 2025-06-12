const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateApplicants, validateApplicantsUpdate } = require("../../utils/validator");
const ApplicantsController = require("../../controllers/career/applicantsController");

router.get("/", ApplicantsController.getAll);
router.get("/:id", ApplicantsController.getById);

// Admin-only routes
router.use(authMiddleware(["admin"]));
router.post("/", validateApplicants, validateMiddleware, ApplicantsController.create);
router.put("/:id", validateApplicantsUpdate, validateMiddleware, ApplicantsController.update);
router.delete("/:id", authMiddleware(["admin"]), ApplicantsController.delete);

module.exports = router;