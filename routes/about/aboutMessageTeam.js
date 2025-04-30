const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AboutMessageTeamController = require("../../controllers/about/aboutMessageTeamController");
const { validateAboutMessageFromTeam, validateAboutMessageFromTeamUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("about-message-teams");
const uploadField = upload.single("image")

router.get("/", AboutMessageTeamController.getAll);
router.get("/:id", AboutMessageTeamController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAboutMessageFromTeam, validateMiddleware, AboutMessageTeamController.create);
router.put("/:id", uploadField, validateAboutMessageFromTeamUpdate, validateMiddleware, AboutMessageTeamController.update);
router.delete("/:id", AboutMessageTeamController.delete);

module.exports = router;
