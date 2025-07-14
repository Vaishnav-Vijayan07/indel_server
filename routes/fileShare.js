const express = require("express");
const router = express.Router();
const FileShareController = require("../controllers/fileShareController");
const createUploadMiddleware = require("../middlewares/multerMiddleware");
const upload = createUploadMiddleware("file-share");
const uploadField = upload.single("file");

router.post("/", uploadField, FileShareController.create);
router.get("/", FileShareController.getAllFiles);
router.put("/:id", uploadField, FileShareController.updateFile);
router.delete("/:id", FileShareController.deleteFile);

module.exports = router;
