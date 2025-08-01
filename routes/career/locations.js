const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const LocationsController = require("../../controllers/career/locationsController");
const { validateCareerLocations, validateCareerLocationsUpdate } = require("../../utils/validator");

router.get("/by_district_state/", LocationsController.getAllByStateDistrict);
router.get("/", LocationsController.getAll);
router.get("/:id", LocationsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateCareerLocations, validateMiddleware, LocationsController.create);
router.put("/:id", validateCareerLocationsUpdate, validateMiddleware, LocationsController.update);
router.delete("/:id", LocationsController.delete);

module.exports = router;
