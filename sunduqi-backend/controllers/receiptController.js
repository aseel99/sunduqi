const { Receipt, User, Branch } = require('../models');  // Changed from '../routes'
const { Op } = require('sequelize');
const { generateReceiptNumber } = require('../utils/generators');
const path = require('path');


exports.getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'full_name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] },
        { model: User, as: 'approver', attributes: ['id', 'username', 'full_name'] }
      ]
    });

    res.status(200).json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'فشل في جلب السندات', error: error.message });
  }
};


exports.createReceipt = async (req, res) => {
  try {
    const { amount, payment_method, client_name, notes, user_id, branch_id } = req.body;

    // Validate required fields
    if (!amount || !payment_method || !user_id || !branch_id) {
      return res.status(400).json({ message: 'الحقول المطلوبة ناقصة' });
    }

    // Generate a unique receipt number
    const receipt_number = await generateReceiptNumber();

    // Handle optional attachment
    let attachment_url = null;
    if (req.file) {
      attachment_url = `/uploads/${req.file.filename}`; // Adjust to your upload path
    }

    const newReceipt = await Receipt.create({
      receipt_number,
      amount,
      payment_method,
      client_name,
      notes,
      user_id,
      branch_id,
      attachment_url
    });

    res.status(201).json({
      message: 'تم إنشاء السند بنجاح ✅',
      receipt: newReceipt
    });
  } catch (err) {
    console.error('Error creating receipt:', err);
    res.status(500).json({ message: 'خطأ في حفظ السند ❌', error: err.message });
  }
};

// Add these missing controller methods:
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Branch, as: 'branch' }
      ]
    });
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    
    await receipt.update(req.body);
    res.json(receipt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.approveReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    
    receipt.is_approved = true;
    receipt.approved_by = req.user.id;
    await receipt.save();
    
    res.json({ message: 'Receipt approved', receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};