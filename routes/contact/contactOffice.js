const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const ContactOfficeController = require("../../controllers/contact/contactOfficeController");
const { validateContactOffices, validateContactOfficesUpdate } = require("../../utils/validator");

router.get("/", ContactOfficeController.getAll);
router.get("/:id", ContactOfficeController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateContactOffices, validateMiddleware, ContactOfficeController.create);
router.put("/:id", validateContactOfficesUpdate, validateMiddleware, ContactOfficeController.update);
router.delete("/:id", ContactOfficeController.delete);

module.exports = router;
