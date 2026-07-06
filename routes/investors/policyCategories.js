const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const PolicyCategoryController = require("../../controllers/investors/policyCategoryController");
const { validatePolicyCategory, validatePolicyCategoryUpdate } = require("../../utils/validator");

router.get("/get-active-category", PolicyCategoryController.getActiveAll);
router.get("/", PolicyCategoryController.getAll);
router.get("/:id", PolicyCategoryController.getById);

router.use(authMiddleware(["admin", "hr", "hr-executive", "manager"]));
router.post("/", validatePolicyCategory, validateMiddleware, PolicyCategoryController.create);
router.put("/:id", validatePolicyCategoryUpdate, validateMiddleware, PolicyCategoryController.update);
router.delete("/:id", PolicyCategoryController.delete);

module.exports = router;
