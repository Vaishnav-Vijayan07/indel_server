const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateDeptPartners, validateDeptPartnersUpdate } = require("../../utils/validator");
const DeptPartnersController = require("../../controllers/debt/debtPartnersController");

const upload = createUploadMiddleware("dept-partners");
const uploadField = upload.single("image");

router.get("/", DeptPartnersController.getAll);
router.get("/:id", DeptPartnersController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateDeptPartners, validateMiddleware, DeptPartnersController.create);
router.put("/:id", uploadField, validateDeptPartnersUpdate, validateMiddleware, DeptPartnersController.update);
router.delete("/:id", DeptPartnersController.delete);

module.exports = router;
