const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const StatesController = require("../../controllers/career/statesController");
const { validateCareerStates, validateCareerStatesUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("career-states");
const uploadField = upload.single("image");

router.get("/", StatesController.getAll);
router.get("/:id", StatesController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateCareerStates, validateMiddleware, StatesController.create);
router.put("/:id", uploadField, validateCareerStatesUpdate, validateMiddleware, StatesController.update);
router.delete("/:id", StatesController.delete);

module.exports = router;