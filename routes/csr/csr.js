const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateBlogs, validateBlogsUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const createUploadMiddleware = require("../../middlewares/multerMiddleware");
const CsrController = require("../../controllers/CSR/csrController");

const upload = createUploadMiddleware("csr");
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "second_image", maxCount: 1 },
]);

router.get("/", CsrController.getAll);
router.get("/:slug", CsrController.getById);
router.use(authMiddleware(["admin"]));
router.post("/", uploadFields, validateBlogs, validateMiddleware, CsrController.create);
router.put("/:id", uploadFields, validateBlogsUpdate, validateMiddleware, CsrController.update);
router.delete("/:id", CsrController.delete);

module.exports = router;
