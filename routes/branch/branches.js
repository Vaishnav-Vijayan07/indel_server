const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const BranchesController = require("../../controllers/branch/branchesController");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const upload = createUploadMiddleware("branch_import");
const uploadField = upload.single("file");

router.get("/filtered_branches", BranchesController.getAllBranchesFilter);
router.get("/", BranchesController.getAll);
router.get("/:id", BranchesController.getById);

router.use(authMiddleware(["admin"]));
// router.post("/", validateBranch, validateMiddleware, BranchesController.create);
router.post("/", validateMiddleware, BranchesController.create);
// router.put("/:id", validateBranchUpdate, validateMiddleware, BranchesController.update);
router.put("/:id", validateMiddleware, BranchesController.update);
router.delete("/:id", BranchesController.delete);
router.post("/importBranch", uploadField, BranchesController.importBranch);

module.exports = router;
