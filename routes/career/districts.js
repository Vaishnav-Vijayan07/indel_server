const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const { validateCareerDistricts, validateCareerDistrictsUpdate } = require("../../utils/validator");
const DistrictsController = require("../../controllers/career/districtController");

router.get("/", DistrictsController.getAll);
router.get("/:id", DistrictsController.getById);
router.get("/by_state/:id", DistrictsController.getDistrictsByStateId);

router.use(authMiddleware(["admin"]));
router.post("/",  validateCareerDistricts, validateMiddleware, DistrictsController.create);
router.put("/:id", validateCareerDistrictsUpdate, validateMiddleware, DistrictsController.update);
router.delete("/:id", DistrictsController.delete);

module.exports = router;
