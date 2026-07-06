const express = require("express");
const router = express.Router();
const FileShareController = require("../controllers/fileShareController");
const createUploadMiddleware = require("../middlewares/multerMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = createUploadMiddleware("file-share");
const uploadField = upload.single("file");

router.get("/", FileShareController.getAllFiles);

router.use(authMiddleware(["admin", "hr", "hr-executive", "manager"]));

router.post("/", uploadField, FileShareController.create);
router.put("/:id", uploadField, FileShareController.updateFile);
router.delete("/:id", FileShareController.deleteFile);

module.exports = router;
