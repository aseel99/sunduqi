const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cashMatchingController = require('../controllers/cashMatchingController');
const deliveryController = require('../controllers/cashDeliveryController'); // ✅ Make sure this file exists and exports needed functions

// Matching routes
router.get('/branch_totals', auth, cashMatchingController.getBranchTotals);
router.post('/confirm', cashMatchingController.cashierConfirmMatch);
router.get('/matching-summary', auth, cashMatchingController.getMatchingSummary);

router.get('/', auth, cashMatchingController.getAllMatchings);
router.post('/', auth, cashMatchingController.createMatching);
router.get('/:id', auth, cashMatchingController.getMatchingById);
router.put('/:id', auth, cashMatchingController.updateMatching);
router.patch('/:id/resolve', auth, cashMatchingController.resolveMatching);
router.post('/admin-confirm', auth, cashMatchingController.adminConfirmMatches);
router.get('/matched-total', auth, deliveryController.getMatchedTotal); // ✅ Needs auth if it's sensitive

module.exports = router;
