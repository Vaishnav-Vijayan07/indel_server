const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const { validateManagementTeam, validateManagementTeamUpdate } = require("../../utils/validator");
const DirectorsController = require("../../controllers/directors/directorsController");

const upload = createUploadMiddleware("directors");
const uploadField = upload.single("image")

router.get("/", DirectorsController.getAll);
router.get("/:id", DirectorsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateManagementTeam, validateMiddleware, DirectorsController.create);
router.put("/:id", uploadField, validateManagementTeamUpdate, validateMiddleware, DirectorsController.update);
router.delete("/:id", DirectorsController.delete);

module.exports = router;
