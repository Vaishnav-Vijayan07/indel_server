const express = require("express");
const TranslateController = require("../controllers/translate/translateController");

const router = express.Router();

router.post("/", TranslateController.translate);

module.exports = router;
