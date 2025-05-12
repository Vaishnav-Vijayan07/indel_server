const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateGoldLoanFeature, validateGoldLoanFeatureUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const EmployeeBenefitsController = require("../../controllers/career/employeeBenfController");

const upload = createUploadMiddleware("employee-benefits");
const uploadField = upload.single("icon");

router.get("/", EmployeeBenefitsController.getAll);
router.get("/:id", EmployeeBenefitsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateGoldLoanFeature, validateMiddleware, EmployeeBenefitsController.create);
router.put("/:id", uploadField, validateGoldLoanFeatureUpdate, validateMiddleware, EmployeeBenefitsController.update);
router.delete("/:id", EmployeeBenefitsController.delete);

module.exports = router;
