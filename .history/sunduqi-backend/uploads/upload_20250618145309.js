const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);

    // إذا لم يكن هناك امتداد، نحاول استخدام نوع الملف لإيجاد الامتداد
    if (!ext) {
      ext = '.' + mime.extension(file.mimetype);
    }

    const filename = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload;
