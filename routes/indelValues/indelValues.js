const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const IndelValuesController = require("../../controllers/indelValues/indelValuesController");
const { generateStringValidators, validateIndelValue, validateIndelValueUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("indel-values");
const uploadField = upload.single("icon");

router.get("/", IndelValuesController.getAll);
router.get("/:id", IndelValuesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateIndelValue, validateMiddleware, IndelValuesController.create);
router.put("/:id", uploadField, validateIndelValueUpdate, validateMiddleware, IndelValuesController.update);
router.delete("/:id", IndelValuesController.delete);

module.exports = router;
