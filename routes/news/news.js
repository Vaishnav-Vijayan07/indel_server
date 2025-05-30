const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const NewsController = require("../../controllers/news/newsController");
const { validateNews, validateNewsUpdate } = require("../../utils/validator");

const upload = createUploadMiddleware("news");
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "second_image", maxCount: 1 },
]);

router.get("/", NewsController.getAll);
router.get("/:id", NewsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateNews, validateMiddleware, NewsController.create);
router.put("/:id", uploadFields, validateNewsUpdate, validateMiddleware, NewsController.update);
router.delete("/:id", NewsController.delete);

module.exports = router;