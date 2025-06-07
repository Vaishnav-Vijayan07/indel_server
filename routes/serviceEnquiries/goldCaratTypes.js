const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateGoldCaratType, validateGoldCaratTypeUpdate } = require("../../utils/validator");
const GoldCaratTypesController = require("../../controllers/serviceEnquiries/goldCaratTypes");

router.get("/", GoldCaratTypesController.getAll);
router.get("/:id", GoldCaratTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateGoldCaratType, validateMiddleware, GoldCaratTypesController.create);
router.put("/:id", validateGoldCaratTypeUpdate, validateMiddleware, GoldCaratTypesController.update);
router.delete("/:id", GoldCaratTypesController.delete);

module.exports = router;
