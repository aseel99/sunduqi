const express = require('express');
const router = express.Router();
const openingBalanceController = require('../controllers/openingBalanceController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// Validation rules
const createBalanceValidation = [
  check('amount')
    .isDecimal({ decimal_digits: '2' })
    .withMessage('Amount must be a valid decimal with 2 decimal places')
    .toFloat(),
  check('date')
    .isISO8601()
    .withMessage('Invalid date format (YYYY-MM-DD)'),
  check('branch_id')
    .isInt()
    .withMessage('Branch ID must be an integer')
];

router.get('/', openingBalanceController.getAllBalances);
router.post(
  '/',
  authMiddleware,
  createBalanceValidation,
  openingBalanceController.createBalance
);
router.get('/:id', openingBalanceController.getBalanceById);
router.put('/:id', authMiddleware, openingBalanceController.updateBalance);

module.exports = router;