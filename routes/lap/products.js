const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateCdLoanProducts, validateCdLoanProductsUpdate } = require("../../utils/validator");
const LapProductsController = require("../../controllers/lap/productsController");

const upload = createUploadMiddleware("lap-products");
const uploadField = upload.single("icon");

router.get("/", LapProductsController.getAll);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCdLoanProducts, validateMiddleware, LapProductsController.create);
router.put("/:id", uploadField, validateCdLoanProductsUpdate, validateMiddleware, LapProductsController.update);
router.delete("/:id", LapProductsController.delete);

module.exports = router;