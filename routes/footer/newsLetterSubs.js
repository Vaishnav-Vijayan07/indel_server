const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const NewsLetterSubsController = require("../../controllers/footer/newsLetterSubsController");
const { validateNewsLetterSubs } = require("../../utils/validator");

router.post("/", validateNewsLetterSubs, validateMiddleware, NewsLetterSubsController.create);
router.use(authMiddleware(["admin"]));
router.get("/", NewsLetterSubsController.getAll);
router.get("/:id", NewsLetterSubsController.getById);

module.exports = router;
