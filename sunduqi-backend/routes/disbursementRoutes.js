const express = require('express');
const router = express.Router();
const disbursementController = require('../controllers/disbursementController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Define upload config here (or import from a separate file if you prefer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Routes
router.get('/', disbursementController.getAllDisbursements);

router.post(
  '/',
  authMiddleware,
  upload.single('attachment'),
  disbursementController.createDisbursement
);

router.get('/:id', disbursementController.getDisbursementById);
router.put('/:id', disbursementController.updateDisbursement);
router.patch('/:id/approve', disbursementController.approveDisbursement);

module.exports = router;
