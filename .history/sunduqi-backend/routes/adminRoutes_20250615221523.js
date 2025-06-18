const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// احصائيات الادمن
router.get('/dashboard-stats', auth, adminController.getDashboardStats);

// احصائيات الكاشير (جديدة)
router.get('/dashboard-stats/casher', auth, adminController.getCasherStats);

module.exports = router;
