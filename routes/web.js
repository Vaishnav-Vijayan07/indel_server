const express = require('express');
const router = express.Router();
const WebController = require('../controllers/webController');

router.get('/home', WebController.getHomeData);
router.get('/about', WebController.aboutData);
router.get('/management', WebController.mangementData);
router.get('/partners', WebController.partnersData);
router.get('/contacts', WebController.contactData);
router.get('/history', WebController.historyData);
router.get('/blogs', WebController.blogData);
router.get('/blogs/:slug', WebController.blogDetails);

module.exports = router;