const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateJobs, validateJobsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const JobsController = require("../../controllers/career/jobsController");

router.get("/dropdowns", JobsController.getDropdowns);
router.get("/", JobsController.getAll);
router.get("/:id", JobsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateJobs, validateMiddleware, JobsController.create);
router.put("/:id", validateJobsUpdate, validateMiddleware, JobsController.update);
router.delete("/:id", JobsController.delete);

module.exports = router;
