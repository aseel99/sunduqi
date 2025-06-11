const express = require('express');
const router = express.Router();
const cashDeliveryController = require('../controllers/cashDeliveryController');
const auth = require('../middleware/auth');


router.get('/cash-summary', auth, cashDeliveryController.getCashSummary);
router.get('/matched-confirmed-total', auth, cashDeliveryController.getMatchedConfirmationsForDate);

router.post('/', auth, cashDeliveryController.createDelivery);
router.get('/', cashDeliveryController.getAllDeliveries);
router.get('/matched-total', auth, cashDeliveryController.getMatchedTotal);


// router.post('/', cashDeliveryController.createDelivery);
router.get('/:id', cashDeliveryController.getDeliveryById);  // ← this should come after
router.put('/:id', cashDeliveryController.updateDelivery);
router.patch('/:id/verify', cashDeliveryController.verifyDelivery);

module.exports = router;