const express = require("express");
const router = express.Router();
const HomeLoanStepController = require("../../controllers/homePage/homeLoanStepController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateHomeLoanStep, validateHomeLoanStepUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");

const upload = createUploadMiddleware("home-loan-steps");
const uploadField = upload.single("icon");

router.get("/", HomeLoanStepController.getAll);
router.get("/:id", HomeLoanStepController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateHomeLoanStep, validateMiddleware, HomeLoanStepController.create);
router.put("/:id", uploadField, validateHomeLoanStepUpdate, validateMiddleware, HomeLoanStepController.update);
router.delete("/:id", HomeLoanStepController.delete);

module.exports = router;
