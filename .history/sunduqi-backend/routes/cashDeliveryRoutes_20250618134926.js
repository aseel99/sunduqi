const express = require('express');
const router = express.Router();
const cashDeliveryController = require('../controllers/cashDeliveryController');
const auth = require('../middleware/auth');

// ✅ ثابتة أولاً
router.get('/cash-summary', auth, cashDeliveryController.getCashSummary);
router.get('/matched-confirmed-total', auth, cashDeliveryController.getMatchedConfirmationsForDate);
router.get('/pending-vouchers', auth, cashDeliveryController.getPendingDeliveries);
router.get('/today-status', auth, cashDeliveryController.getTodayDeliveriesByStatus);
router.get('/matched-total', auth, cashDeliveryController.getMatchedTotal);

// ✅ عمليات إنشاء وتحديث
router.post('/', auth, cashDeliveryController.createDelivery);
router.post('/close-only', auth, cashDeliveryController.closeCashboxOnly);
router.post('/deliver-closed', auth, cashDeliveryController.deliverClosedCash);

// ✅ استعلام عام
router.get('/', cashDeliveryController.getAllDeliveries);


router.get('/:id', cashDeliveryController.getDeliveryById);
router.put('/:id', cashDeliveryController.updateDelivery);
router.patch('/:id/verify', cashDeliveryController.verifyDelivery);

module.exports = router;
