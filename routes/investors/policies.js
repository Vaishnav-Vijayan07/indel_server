const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const PoliciesController = require("../../controllers/investors/policiesController");
const { validatePolicies, validatePoliciesUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/policies");
const uploadField = upload.single("file");

router.get("/", PoliciesController.getAll);
router.get("/:id", PoliciesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validatePolicies, validateMiddleware, PoliciesController.create);
router.put("/:id", uploadField, validatePoliciesUpdate, validateMiddleware, PoliciesController.update);
router.delete("/:id", PoliciesController.delete);

module.exports = router;