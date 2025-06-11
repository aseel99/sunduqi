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

exports.getTransferSummary = async (req, res) => {
  try {
    // الحصول على جميع الفروع
    const branches = await Branch.findAll({ where: { is_active: true } });

    // تجميع البيانات لكل فرع
    const result = await Promise.all(
      branches.map(async (branch) => {
        const branch_id = branch.id;

        // إجمالي المقبوضات والمصروفات
        const [totalReceipts, totalDisbursements] = await Promise.all([
          Receipt.sum('amount', { where: { branch_id } }),
          Disbursement.sum('amount', { where: { branch_id } })
        ]);

        const finalBalance = (totalReceipts || 0) - (totalDisbursements || 0);

        // إجمالي المبالغ المرحلة مسبقاً
        const transferred = await BankTransfer.sum('final_balance', { where: { branch_id } });

        return {
          branch_id,
          branch_name: branch.name_ar,
          total_receipts: parseFloat(totalReceipts || 0),
          total_disbursements: parseFloat(totalDisbursements || 0),
          final_balance: parseFloat(finalBalance || 0),
          transferred: parseFloat(transferred || 0),
          not_transferred: parseFloat(finalBalance || 0) - parseFloat(transferred || 0)
        };
      })
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getTransferSummary:', error);
    res.status(500).json({ success: false, message: 'فشل تحميل ملخص الترحيل', error: error.message });
  }
};
