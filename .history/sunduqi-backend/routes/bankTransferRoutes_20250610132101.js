const express = require('express');
const router = express.Router();
const controller = require('../controllers/bankTransferController');
const auth = require('../middleware/auth');

router.post('/confirm', auth, controller.confirmTransfer);
router.get('/check', auth, controller.checkTransferStatus);

module.exports = router;
