const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateCSRPageContentUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const   CsrContentController = require("../../controllers/CSR/contentController");

router.get("/", CsrContentController.get);
router.put("/", authMiddleware(["admin"]), validateCSRPageContentUpdate, validateMiddleware, CsrContentController.update);

module.exports = router;
