const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const {  validateIndelValue, validateIndelValueUpdate } = require("../../utils/validator");
const ApproachPropositionsController = require("../../controllers/indelValues/approachPropositionsController");

const upload = createUploadMiddleware("approach-propositions");
const uploadField = upload.single("icon");

router.get("/", ApproachPropositionsController.getAll);
router.get("/:id", ApproachPropositionsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateIndelValue, validateMiddleware, ApproachPropositionsController.create);
router.put("/:id", uploadField, validateIndelValueUpdate, validateMiddleware, ApproachPropositionsController.update);
router.delete("/:id", ApproachPropositionsController.delete);

module.exports = router;
