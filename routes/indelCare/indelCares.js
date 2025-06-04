const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateIndelCares, validateIndelCaresUpdate } = require("../../utils/validator");
const IndelCaresController = require("../../controllers/indelCare/indelCaresController");

const upload = createUploadMiddleware("indel-cares");
const uploadField = upload.single("image");

router.get("/", IndelCaresController.getAll);
router.get("/:id", IndelCaresController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateIndelCares, validateMiddleware, IndelCaresController.create);
router.put("/:id", uploadField, validateIndelCaresUpdate, validateMiddleware, IndelCaresController.update);
router.delete("/:id", IndelCaresController.delete);

module.exports = router;