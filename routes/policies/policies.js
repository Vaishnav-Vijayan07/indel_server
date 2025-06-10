const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const PoliciesController = require("../../controllers/policies/policies");

router.get('/type/', PoliciesController.findByType);
router.get("/", PoliciesController.getAll);

router.use(authMiddleware(["admin"]));
router.post("/", PoliciesController.create);
router.put("/:id", PoliciesController.update);
router.delete("/:id", PoliciesController.delete);

module.exports = router;
