const express = require('express');
const router = express.Router();
const cashCollectionController = require('../controllers/cashCollectionController');
const auth = require('../middleware/auth'); // إضافة الـ middleware للمصادقة

// تجميع التسليمات للمستخدمين حسب التاريخ (محمي)
router.get('/grouped', auth, cashCollectionController.getGroupedDeliveries);

// جلب كل التسليمات (محمي)
router.get('/', auth, cashCollectionController.getAllCollections);

// إنشاء استلام جديد (محمي)
router.post('/', auth, cashCollectionController.createCollection);

// جلب استلام حسب المعرّف (محمي)
router.get('/:id', auth, cashCollectionController.getCollectionById);

// تحديث استلام (محمي)
router.put('/:id', auth, cashCollectionController.updateCollection);

// تأكيد الاستلام (محمي)
router.patch('/:id/verify', auth, cashCollectionController.verifyCollection);

module.exports = router;
