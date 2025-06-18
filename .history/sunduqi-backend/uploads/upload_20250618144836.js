const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Folder to store uploaded files
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get file extension
    const filename = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload;
