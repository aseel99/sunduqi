const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth'); // adjust path if needed
const disbursementController = require('../controllers/disbursementController');

const router = express.Router(); // ✅ Define router

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Define the route
router.post(
  '/',
  authMiddleware,                  // 👈 auth first
  upload.single('attachment'),     // 👈 multer middleware
  disbursementController.createDisbursement
);

// Export the router so it can be used in your routes
module.exports = router;
