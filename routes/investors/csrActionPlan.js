const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CsrActionPlanController = require("../../controllers/investors/csrActionPlanController");
const { validateCsrActionPlan, validateCsrActionPlanUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/csr-action-plans");
const uploadField = upload.single("report");

router.get("/", CsrActionPlanController.getAll);
router.get("/:id", CsrActionPlanController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCsrActionPlan, validateMiddleware, CsrActionPlanController.create);
router.put("/:id", uploadField, validateCsrActionPlanUpdate, validateMiddleware, CsrActionPlanController.update);
router.delete("/:id", CsrActionPlanController.delete);

module.exports = router;
