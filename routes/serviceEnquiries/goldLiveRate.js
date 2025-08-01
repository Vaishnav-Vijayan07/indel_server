const express = require("express");
const router = express.Router();
const GoldLiveRateController = require("../../controllers/serviceEnquiries/goldLiveRate");

router.post("/", GoldLiveRateController.getLatestLTV);

module.exports = router;