const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCareerContentsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CareerContentsController = require("../../controllers/career/careerContentController");

const upload = createUploadMiddleware("career-contents");
const uploadFields = upload.single("make_your_move_image");

router.get("/", CareerContentsController.get);
router.put("/", authMiddleware(["admin"]), uploadFields, validateCareerContentsUpdate, validateMiddleware, CareerContentsController.update);

module.exports = router;
