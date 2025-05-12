const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateRoles, validateCareerRoles, validateCareerRolesUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const RolesController = require("../../controllers/career/rolesController");

router.get("/", RolesController.getAll);
router.get("/:id", RolesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateCareerRoles, validateMiddleware, RolesController.create);
router.put("/:id", validateCareerRolesUpdate, validateMiddleware, RolesController.update);
router.delete("/:id", RolesController.delete);

module.exports = router;
