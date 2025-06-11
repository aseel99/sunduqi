const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getAllNotifications);
router.get('/unread', auth, notificationController.getUnreadNotifications);
// router.get('/unread-count', auth, notificationController.getUnreadCount); // if re-enabled
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.post('/', auth, notificationController.createNotification);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
