const express = require('express');
const router = express.Router();
const bankTransferController = require('../controllers/bankTransferController');
const auth = require('../middleware/auth');

router.get('/check', auth, bankTransferController.checkTransferStatus);
router.post('/confirm', auth, bankTransferController.confirmTransfer);
router.post('/bulk-transfer', auth, bankTransferController.bulkTransferFromTotal);
router.get('/summary', auth, bankTransferController.getTransferSummary);

module.exports = router;
