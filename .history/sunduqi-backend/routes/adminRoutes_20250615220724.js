const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/dashboard-stats/casher', auth, adminController.getCasherStats);

module.exports = router;
