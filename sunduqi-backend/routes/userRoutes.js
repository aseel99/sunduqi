const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ✅ Import auth middleware
const userController = require('../controllers/userController');

// Protected routes
router.get('/', auth, userController.getAllUsers);
router.post('/', auth, userController.createUser);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, userController.updateUser);
router.patch('/:id/toggle-active', auth, userController.toggleUserActive);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
