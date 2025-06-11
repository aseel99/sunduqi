const express = require('express');
const router = express.Router();
const cashCollectionController = require('../controllers/cashCollectionController');

router.get('/', cashCollectionController.getAllCollections);
router.post('/', cashCollectionController.createCollection);
router.get('/:id', cashCollectionController.getCollectionById);
router.put('/:id', cashCollectionController.updateCollection);
router.patch('/:id/verify', cashCollectionController.verifyCollection);

module.exports = router;