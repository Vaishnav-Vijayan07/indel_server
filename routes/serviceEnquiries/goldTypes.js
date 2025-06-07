const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateGoldType, validateGoldTypeUpdate } = require("../../utils/validator");
const GoldTypesController = require("../../controllers/serviceEnquiries/goldTypes");

router.get("/", GoldTypesController.getAll);
router.get("/:id", GoldTypesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateGoldType, validateMiddleware, GoldTypesController.create);
router.put("/:id", validateGoldTypeUpdate, validateMiddleware, GoldTypesController.update);
router.delete("/:id", GoldTypesController.delete);

module.exports = router;
