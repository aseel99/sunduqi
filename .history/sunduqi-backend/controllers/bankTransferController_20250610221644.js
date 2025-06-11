// controllers/bankTransferController.js
const { Branch, Receipt, Disbursement, BankTransfer, User } = require('../models');
const { Op, Sequelize } = require('sequelize');


exports.confirmTransfer = async (req, res) => {
  try {
    const { branch_id, date, amount } = req.body;
    const transferred_by = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'المبلغ غير صالح' });
    }

    // منع التكرار لنفس الفرع واليوم
    const existing = await BankTransfer.findOne({ where: { branch_id, date } });
    if (existing) return res.status(400).json({ message: 'تم ترحيل هذا اليوم مسبقاً' });

    // تحديد الفترة الزمنية لليوم
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [totalReceipts, totalDisbursements] = await Promise.all([
      Receipt.sum('amount', {
        where: {
          branch_id,
          created_at: { [Op.between]: [startOfDay, endOfDay] }
        }
      }),
      Disbursement.sum('amount', {
        where: {
          branch_id,
          created_at: { [Op.between]: [startOfDay, endOfDay] }
        }
      }),
    ]);

    const calculatedBalance = (totalReceipts || 0) - (totalDisbursements || 0);

    // التحقق من أن المستخدم لا يرحل أكثر من المسموح
    if (amount > calculatedBalance) {
      return res.status(400).json({ message: 'المبلغ المرحل أكبر من المتبقي' });
    }

    const transfer = await BankTransfer.create({
      branch_id,
      date,
      total_receipts: totalReceipts || 0,
      total_disbursements: totalDisbursements || 0,
      final_balance: amount, // هنا نستخدم المبلغ المدخل فقط
      transferred_by,
      transferred_at: new Date(),
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
    const { date } = req.query;

    // لو فيه تاريخ، نحدد البداية والنهاية لذلك اليوم
    const hasDate = !!date;
    const targetDate = hasDate ? new Date(date) : null;
    const formattedDate = hasDate ? targetDate.toISOString().slice(0, 10) : null;
    const startOfDay = hasDate ? new Date(targetDate.setHours(0, 0, 0, 0)) : null;
    const endOfDay = hasDate ? new Date(targetDate.setHours(23, 59, 59, 999)) : null;

    const branches = await Branch.findAll({ where: { is_active: true } });

    const result = await Promise.all(
      branches.map(async (branch) => {
        const branch_id = branch.id;

        // المقبوضات والمصروفات
        const [totalReceipts, totalDisbursements] = await Promise.all([
          Receipt.sum('amount', {
            where: {
              branch_id,
              ...(hasDate && {
                created_at: { [Op.between]: [startOfDay, endOfDay] }
              })
            }
          }),
          Disbursement.sum('amount', {
            where: {
              branch_id,
              ...(hasDate && {
                created_at: { [Op.between]: [startOfDay, endOfDay] }
              })
            }
          }),
        ]);

        const finalBalance = (totalReceipts || 0) - (totalDisbursements || 0);

        // الترحيلات المرحلة لهذا الفرع
        const transferred = await BankTransfer.sum('final_balance', {
          where: {
            branch_id,
            ...(hasDate && { date: formattedDate })
          }
        });

        return {
          branch_id,
          branch_name: branch.name_ar,
          date: formattedDate || 'الكل',
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
