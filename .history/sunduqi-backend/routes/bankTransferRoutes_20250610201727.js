const express = require('express');
const router = express.Router();
const bankTransferController = require('../controllers/bankTransferController');
const auth = require('../middleware/auth'); // ✅ دالة صحيحة هنا

// Route to check transfer status
router.get('/check', auth, bankTransferController.checkTransferStatus);

// Route to confirm transfer
router.post('/confirm', auth, bankTransferController.confirmTransfer);

// ✅ إظهار ملخص المجاميع لكل فرع (تشمل المجاميع المُرحلة وغير المُرحلة)
router.get('/summary', auth, bankTransferController.getTransferSummary);


module.exports = router;
