const express = require('express');
const router = express.Router();
const multer = require('multer');
const receiptController = require('../controllers/receiptController');

// Configure multer to store uploaded files in 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

router.get('/', receiptController.getReceipts);
router.post('/', upload.single('attachment'), receiptController.createReceipt);
router.get('/:id', receiptController.getReceiptById);
router.put('/:id', receiptController.updateReceipt);
router.patch('/:id/approve', receiptController.approveReceipt);

module.exports = router;
