const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/usersController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware(["admin", "hr", "hr-executive", "user"]));

router.post("/", UsersController.create);
router.get("/", UsersController.getAll);
router.get("/:id", UsersController.getById);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.delete);

module.exports = router;
