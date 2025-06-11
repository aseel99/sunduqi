const express = require('express');
const router = express.Router();
const bankTransferController = require('../controllers/bankTransferController
const auth = require('../middleware/auth');

// Route to confirm transfer
router.post('/confirm', auth, bankTransferController.confirmTransfer);

// Route to check transfer status
router.get('/check', auth, bankTransferController.checkTransferStatus);

module.exports = router;
