const express = require("express");
const router = express.Router();
const HomeFaqController = require("../../controllers//homePage/homeFaqController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { validateFaq, validateFaqUpdate } = require("../../utils/validator");
const validateMiddleware = require("../../middlewares/validateMiddleware");

router.get("/", HomeFaqController.getAll);
router.get("/:id", HomeFaqController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateFaq, validateMiddleware, HomeFaqController.create);
router.put("/:id", validateFaqUpdate, validateMiddleware, HomeFaqController.update);
router.delete("/:id", HomeFaqController.delete);

module.exports = router;
