const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const CareerMetaController = require("../../controllers/career/metaController");

router.get('/type/', CareerMetaController.findByType);
router.get("/", CareerMetaController.getAll);

router.use(authMiddleware(["admin"]));
router.post("/", CareerMetaController.create);
router.put("/:id", CareerMetaController.update);
router.delete("/:id", CareerMetaController.delete);

module.exports = router;
