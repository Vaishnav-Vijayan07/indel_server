const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const AwardsController = require("../../controllers/awards/awardsController");
const { validateAward, validateAwardUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("awards");
const uploadField = upload.single("image");

router.get("/", AwardsController.getAll);
router.get("/:id", AwardsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadField, validateAward, validateMiddleware, AwardsController.create);
router.put("/:id", uploadField, validateAwardUpdate, validateMiddleware, AwardsController.update);
router.delete("/:id", AwardsController.delete);

module.exports = router;