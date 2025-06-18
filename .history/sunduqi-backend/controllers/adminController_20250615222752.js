const { User, Branch, Receipt, Disbursement, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Count receipts/disbursements
    const [totalReceipts, totalDisbursements, branchesCount] = await Promise.all([
      Receipt.sum('amount'),
      Disbursement.sum('amount'),
      Branch.count()
    ]);

    // 2. Calculate current balance
    const currentBalance = (totalReceipts || 0) - (totalDisbursements || 0);

    // 3. Latest 5 receipts and disbursements (sorted by created_at)
    const recentReceipts = await Receipt.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Branch, as: 'branch', attributes: ['name_ar'] }]
    });

    const recentDisbursements = await Disbursement.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Branch, as: 'branch', attributes: ['name_ar'] }]
    });

    // Merge & tag type
    const recentVouchers = [...recentReceipts.map(r => ({
      id: r.id,
      type: 'receipt',
      receipt_number: r.receipt_number,
      branch_name: r.branch?.name_ar || '',
      amount: parseFloat(r.amount),
      created_at: r.created_at
    })), ...recentDisbursements.map(d => ({
      id: d.id,
      type: 'disbursement',
      disbursement_number: d.disbursement_number,
      branch_name: d.branch?.name_ar || '',
      amount: parseFloat(d.amount),
      created_at: d.created_at
    }))].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

    // 4. Latest notifications
    const recentNotifications = await Notification.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'message', 'created_at']
    });

    res.json({
      total_receipts: parseFloat(totalReceipts || 0),
      total_disbursements: parseFloat(totalDisbursements || 0),
      current_balance: parseFloat(currentBalance || 0),
      branches_count: branchesCount,
      recent_vouchers: recentVouchers,
      recent_notifications: recentNotifications
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};


exports.getCasherStats = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.branch_id) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    const branchId = user.branch_id;

    // Total Receipts for the cashier's branch
    const receiptsSum = await Receipt.sum('amount', {
      where: { branch_id: branchId }
    });

    // Total Disbursements for the cashier's branch
    const disbursementsSum = await Disbursement.sum('amount', {
      where: { branch_id: branchId }
    });

    // Recent 5 vouchers (receipts and disbursements) for the branch
    const recentReceipts = await Receipt.findAll({
      where: { branch_id: branchId },
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    const recentDisbursements = await Disbursement.findAll({
      where: { branch_id: branchId },
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    // Merge and sort recent vouchers by date descending
    const recentVouchers = [...recentReceipts.map(r => ({
      ...r,
      type: 'receipt',
      branch_name: (await Branch.findByPk(branchId)).name_ar
    })), ...recentDisbursements.map(d => ({
      ...d,
      type: 'disbursement',
      branch_name: (await Branch.findByPk(branchId)).name_ar
    }))].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

    // Recent notifications for the cashier
    const recentNotifications = await Notification.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Response
    res.json({
      total_receipts: receiptsSum || 0,
      total_disbursements: disbursementsSum || 0,
      current_balance: (receiptsSum || 0) - (disbursementsSum || 0),
      recent_vouchers: recentVouchers,
      recent_notifications: recentNotifications
    });

  } catch (error) {
    console.error('Error in getCasherStats:', error);
    res.status(500).json({ message: 'Failed to load cashier stats' });
  }
};