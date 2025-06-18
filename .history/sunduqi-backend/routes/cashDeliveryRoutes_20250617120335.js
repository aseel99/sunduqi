const express = require('express');
const router = express.Router();
const cashDeliveryController = require('../controllers/cashDeliveryController');
const auth = require('../middleware/auth');



router.get('/cash-summary', auth, cashDeliveryController.getCashSummary);
router.get('/matched-confirmed-total', auth, cashDeliveryController.getMatchedConfirmationsForDate);
router.get('/pending-vouchers', auth, cashDeliveryController.getPendingDeliveries);
router.get('/today-status', auth, cashDeliveryController.getTodayDeliveriesByStatus);


router.post('/', auth, cashDeliveryController.createDelivery);
router.get('/', cashDeliveryController.getAllDeliveries);
router.get('/matched-total', auth, cashDeliveryController.getMatchedTotal);
// ✅ route to close cashbox without delivering
router.post('/close-only', auth, cashDeliveryController.closeCashboxOnly);

// ✅ route to deliver amount that was closed earlier
router.post('/deliver-after-closure', auth, cashDeliveryController.deliverAfterClosure);


router.get('/:id', cashDeliveryController.getDeliveryById);
router.put('/:id', cashDeliveryController.updateDelivery);
router.patch('/:id/verify', cashDeliveryController.verifyDelivery);

module.exports = router;