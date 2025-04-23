const express = require("express");
const router = express.Router();
const HomeStatisticsController = require("../controllers/homeStatisticsController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateHomeStatistics } = require("../utils/validator");
const validateMiddleware = require("../middlewares/validateMiddleware");

router.get("/", HomeStatisticsController.getAll);
router.get("/:id", HomeStatisticsController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateHomeStatistics, validateMiddleware, HomeStatisticsController.create);
router.put("/:id", validateHomeStatistics, validateMiddleware, HomeStatisticsController.update);
router.delete("/:id", HomeStatisticsController.delete);

module.exports = router;
