const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const BranchesController = require("../../controllers/branch/branchesController");
const { validateBranch, validateBranchUpdate } = require("../../utils/validator");

router.get("/filtered_branches", BranchesController.getAllBranchesFilter);
router.get("/", BranchesController.getAll);
router.get("/:id", BranchesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateBranch, validateMiddleware, BranchesController.create);
router.put("/:id", validateBranchUpdate, validateMiddleware, BranchesController.update);
router.delete("/:id", BranchesController.delete);

module.exports = router;
