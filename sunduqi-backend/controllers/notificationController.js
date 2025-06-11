const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');

    const { page = 1, limit = 10, is_read, priority, user_id } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    
    if (user_id) {
      where.user_id = user_id;
    } else {
      where.user_id = req.user.id;
    }

    if (is_read !== undefined) {
      where.is_read = is_read === 'true';
    }

    if (priority) {
      where.priority = priority;
    }

    const notifications = await Notification.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name'] }
      ],
      order: [
        ['is_read', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: notifications.count,
      page: parseInt(page),
      totalPages: Math.ceil(notifications.count / limit),
      data: notifications.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');

    const notifications = await Notification.findAll({
      where: {
        user_id: req.user.id,
        is_read: false
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');

    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, type, title, message, priority, related_table, related_id } = req.body;

    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      priority,
      related_table,
      related_id
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    await notification.update({ is_read: true });

    res.json({ 
      message: 'Notification marked as read',
      is_read: notification.is_read 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
