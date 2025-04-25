const express = require('express');
const router = express.Router();
const WebController = require('../controllers/webController');

router.get('/home', WebController.getHomeData);

module.exports = router;