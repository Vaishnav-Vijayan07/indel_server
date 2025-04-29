const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateHomeLoanStep, validateHomeLoanStepUpdate, validateHomeSmartDeals, validateHomeSmartDealsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const SmartMoneyDealsController = require("../../controllers/homePage/smartMoneyDealsController");

const upload = createUploadMiddleware("home-smart-deals");
const uploadField = upload.single("icon");

router.get("/", SmartMoneyDealsController.getAll);
router.get("/:id", SmartMoneyDealsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateHomeSmartDeals, validateMiddleware, SmartMoneyDealsController.create);
router.put("/:id", uploadField, validateHomeSmartDealsUpdate, validateMiddleware, SmartMoneyDealsController.update);
router.delete("/:id", SmartMoneyDealsController.delete);

module.exports = router;
