const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const OmbudsmanFilesController = require("../../controllers/ombudsman/ombudsmanFilesController");
const { validateCorporateGovernanceUpdate, validateCorporateGovernance } = require("../../utils/validator");

const upload = createUploadMiddleware("ombudsman-files");
const uploadField = upload.single("file");

router.get("/", OmbudsmanFilesController.getAll);
router.get("/:id", OmbudsmanFilesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCorporateGovernance, validateMiddleware, OmbudsmanFilesController.create);
router.put("/:id", uploadField, validateCorporateGovernanceUpdate, validateMiddleware, OmbudsmanFilesController.update);
router.delete("/:id", OmbudsmanFilesController.delete);

module.exports = router;
