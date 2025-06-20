const { Branch, Receipt, Disbursement, BankTransfer } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

function isValidDate(dateStr) {
  return moment(dateStr, 'YYYY-MM-DD', true).isValid();
}
exports.confirmTransfer = async (req, res) => {
  try {
    const { branch_id, date, amount } = req.body;

    // ✅ تأكد من وجود المستخدم
    const transferred_by = req.user?.id;
    if (!transferred_by) {
      return res.status(401).json({ message: 'المستخدم غير مصرح' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'المبلغ غير صالح' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [receiptsSum, disbursementsSum, alreadyTransferred] = await Promise.all([
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
      BankTransfer.sum('final_balance', {
        where: {
          branch_id,
          date: date
        }
      })
    ]);

    const totalReceipts = parseFloat(receiptsSum || 0);
    const totalDisbursements = parseFloat(disbursementsSum || 0);
    const calculatedBalance = totalReceipts - totalDisbursements;
    const transferredSoFar = parseFloat(alreadyTransferred || 0);
    const remainingBalance = calculatedBalance - transferredSoFar;

    if (amount > remainingBalance) {
      return res.status(400).json({ message: 'المبلغ المرحل أكبر من المتبقي لهذا اليوم' });
    }

    const transfer = await BankTransfer.create({
      branch_id,
      date,
      total_receipts: totalReceipts,
      total_disbursements: totalDisbursements,
      final_balance: amount,
      transferred_by,
      transferred_at: new Date(),
    });

    res.status(201).json({ message: 'تم الترحيل بنجاح', data: transfer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'فشل في الترحيل', error: error.message });
  }
};

exports.bulkTransferFromTotal = async (req, res) => {
  try {
    const { date, amount } = req.body;
    const transferred_by = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'المبلغ غير صالح' });
    }

    const totalAmountToTransfer = parseFloat(amount);
    let remainingAmount = totalAmountToTransfer;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    const formattedDate = date;

    const branches = await Branch.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });

    const transfers = [];

    for (const branch of branches) {
      const branch_id = branch.id;

      const [totalReceipts, totalDisbursements, alreadyTransferred] = await Promise.all([
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
        BankTransfer.sum('final_balance', {
          where: {
            branch_id,
            date: formattedDate
          }
        })
      ]);

      const calculatedBalance = (totalReceipts || 0) - (totalDisbursements || 0);
      const branchRemaining = calculatedBalance - (alreadyTransferred || 0);

      if (branchRemaining <= 0 || remainingAmount <= 0) continue;

      const amountToTransfer = Math.min(branchRemaining, remainingAmount);

      const transfer = await BankTransfer.create({
        branch_id,
        date: formattedDate,
        total_receipts: totalReceipts || 0,
        total_disbursements: totalDisbursements || 0,
        final_balance: amountToTransfer,
        transferred_by,
        transferred_at: new Date(),
      });

      transfers.push(transfer);
      remainingAmount -= amountToTransfer;
    }

    res.status(201).json({
      message: 'تم ترحيل المبلغ من المجاميع بنجاح',
      transferred: totalAmountToTransfer - remainingAmount,
      remaining: remainingAmount,
      details: transfers
    });
  } catch (error) {
    console.error('bulkTransferFromTotal error:', error);
    res.status(500).json({ message: 'فشل في ترحيل المجاميع', error: error.message });
  }
};

exports.getTransferSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const hasDate = !!date;

    const targetDate = hasDate ? new Date(date) : null;
    const formattedDate = hasDate ? targetDate.toISOString().slice(0, 10) : null;
    const startOfDay = hasDate ? new Date(targetDate.setHours(0, 0, 0, 0)) : null;
    const endOfDay = hasDate ? new Date(targetDate.setHours(23, 59, 59, 999)) : null;

    const branches = await Branch.findAll({ where: { is_active: true } });

    const result = await Promise.all(branches.map(async (branch) => {
      const branch_id = branch.id;

      const [receipts, disbursements] = await Promise.all([
        Receipt.sum('amount', {
          where: {
            branch_id,
            ...(hasDate && { created_at: { [Op.between]: [startOfDay, endOfDay] } })
          }
        }),
        Disbursement.sum('amount', {
          where: {
            branch_id,
            ...(hasDate && { created_at: { [Op.between]: [startOfDay, endOfDay] } })
          }
        }),
      ]);

      const balance = (receipts || 0) - (disbursements || 0);

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
        total_receipts: parseFloat(receipts || 0),
        total_disbursements: parseFloat(disbursements || 0),
        final_balance: parseFloat(balance || 0),
        transferred: parseFloat(transferred || 0),
        not_transferred: parseFloat(balance || 0) - parseFloat(transferred || 0)
      };
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'فشل تحميل البيانات', error: error.message });
  }
};

exports.checkTransferStatus = async (req, res) => {
  try {
    const { branch_id, date } = req.query;
    const transfer = await BankTransfer.findOne({ where: { branch_id, date } });

    res.json({ isTransferred: !!transfer });
  } catch (error) {
    console.error('Check transfer error:', error);
    res.status(500).json({ message: 'فشل التحقق من الترحيل', error: error.message });
  }
};
