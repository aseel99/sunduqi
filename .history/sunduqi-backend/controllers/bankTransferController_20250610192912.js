// controllers/bankTransferController.js
const { BankTransfer } = require('../models');

exports.confirmTransfer = async (req, res) => {
  try {
    const {
      branch_id,
      date,
      total_receipts,
      total_disbursements,
      final_balance,
    } = req.body;

    const transferred_by = req.user.id;

    // منع التكرار
    const existing = await BankTransfer.findOne({ where: { branch_id, date } });
    if (existing) return res.status(400).json({ message: 'تم ترحيل هذا اليوم مسبقاً' });

    const transfer = await BankTransfer.create({
      branch_id,
      date,
      total_receipts,
      total_disbursements,
      final_balance,
      transferred_by,
    });

    res.status(201).json({ message: 'تم الترحيل بنجاح', data: transfer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'فشل في الترحيل', error: error.message });
  }
};

exports.checkTransferStatus = async (req, res) => {
  try {
    const { branch_id, date } = req.query;
    const transfer = await BankTransfer.findOne({ where: { branch_id, date } });

    res.json({ isTransferred: !!transfer }); // true or false
  } catch (error) {
    console.error('Check transfer error:', error);
    res.status(500).json({ message: 'فشل التحقق من الترحيل', error: error.message });
  }
};
