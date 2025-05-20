const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AnnualReturnsController = require("../../controllers/investors/annualReturnsController");
const { validateAnnualReturns, validateAnnualReturnsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("investors/annual-returns");
const uploadField = upload.single("file");

router.get("/", AnnualReturnsController.getAll);
router.get("/:id", AnnualReturnsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAnnualReturns, validateMiddleware, AnnualReturnsController.create);
router.put("/:id", uploadField, validateAnnualReturnsUpdate, validateMiddleware, AnnualReturnsController.update);
router.delete("/:id", AnnualReturnsController.delete);

module.exports = router;
