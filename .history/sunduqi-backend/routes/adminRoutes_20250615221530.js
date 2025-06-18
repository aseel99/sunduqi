const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');


router.get('/dashboard-stats', auth, adminController.getDashboardStats);

router.get('/dashboard-stats/casher', auth, adminController.getCasherStats);

module.exports = router;
