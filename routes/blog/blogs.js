const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateBlogs, validateBlogsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const BlogsController = require("../../controllers/blog/blogsController");

const upload = createUploadMiddleware("blogs");
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "second_image", maxCount: 1 },
]);

router.get("/", BlogsController.getAll);
router.get("/:slug", BlogsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateBlogs, validateMiddleware, BlogsController.create);
router.put("/:id", uploadFields, validateBlogsUpdate, validateMiddleware, BlogsController.update);
router.delete("/:id", BlogsController.delete);

module.exports = router;
