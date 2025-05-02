const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const ManagementTeamsController = require("../../controllers/management/managementTeamsController");
const { validateManagementTeam, validateManagementTeamUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("management-teams");
const uploadField = upload.single("image")

router.get("/", ManagementTeamsController.getAll);
router.get("/:id", ManagementTeamsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateManagementTeam, validateMiddleware, ManagementTeamsController.create);
router.put("/:id", uploadField, validateManagementTeamUpdate, validateMiddleware, ManagementTeamsController.update);
router.delete("/:id", ManagementTeamsController.delete);

module.exports = router;
