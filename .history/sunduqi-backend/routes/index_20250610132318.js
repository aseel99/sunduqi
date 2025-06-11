const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const branchRoutes = require('./branchRoutes');
const cashCollectionRoutes = require('./cashCollectionRoutes');
const cashDeliveryRoutes = require('./cashDeliveryRoutes');
const cashMatchingRoutes = require('./cashMatchingRoutes');
const disbursementRoutes = require('./disbursementRoutes');
const notificationRoutes = require('./notificationRoutes');
const openingBalanceRoutes = require('./openingBalanceRoutes');
const receiptRoutes = require('./receiptRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const bankTransferRoutes = require('./routes/bankTransferRoutes');



router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/cash-collections', cashCollectionRoutes);
router.use('/cash-deliveries', cashDeliveryRoutes);
router.use('/cash-matching', cashMatchingRoutes);
router.use('/disbursements', disbursementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/opening-balances', openingBalanceRoutes);
router.use('/receipts', receiptRoutes);
router.use('/users', userRoutes);
router.use('bank-transfers', bankTransferRoutes);

module.exports = router;