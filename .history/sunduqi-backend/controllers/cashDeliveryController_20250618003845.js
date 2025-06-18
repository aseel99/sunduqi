const { CashDelivery, Branch, User, OpeningBalance, CashMatching } = require('../models');
const { generateDeliveryNumber } = require('../utils/generators');
const { Op, Sequelize } = require('sequelize');
const { Receipt, Disbursement } = require('../models'); // تأكد أنه موجود

exports.getAllDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 10, branch_id, is_verified, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (branch_id) where.branch_id = branch_id;
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';
    if (fromDate && toDate) {
      where.date = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const deliveries = await CashDelivery.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      data: deliveries.rows,
      count: deliveries.count
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ message: 'فشل في جلب التسليمات', error: error.message });
  }
};


exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await CashDelivery.findByPk(id, {
      include: [
        { model: Branch, as: 'branch' },
        { model: User, as: 'user' },
        { model: OpeningBalance, as: 'opening_balance' },
        { model: User, as: 'verifier' }
      ]
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, opening_balance_id, total_receipts, total_disbursements, delivered_amount, date, notes } = req.body;

    const delivery = await CashDelivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.is_verified) {
      return res.status(400).json({ message: 'Cannot update a verified delivery' });
    }

    await delivery.update({
      branch_id: branch_id || delivery.branch_id,
      opening_balance_id: opening_balance_id || delivery.opening_balance_id,
      total_receipts: total_receipts || delivery.total_receipts,
      total_disbursements: total_disbursements || delivery.total_disbursements,
      delivered_amount: delivered_amount || delivery.delivered_amount,
      date: date || delivery.date,
      notes: notes || delivery.notes
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.verifyDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const verified_by = req.user.id;

    const delivery = await CashDelivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.is_verified) {
      return res.status(400).json({ message: 'Delivery already verified' });
    }

    await delivery.update({
      is_verified: true,
      verified_by,
      verified_at: new Date()
    });

    res.json({ 
      message: 'Delivery verified successfully',
      is_verified: delivery.is_verified 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCashSummary = async (req, res) => {
  try {
    const { user_id, branch_id } = req.query;

    if (!user_id || !branch_id) {
      return res.status(400).json({ message: 'Missing user_id or branch_id' });
    }

    // Aggregate sums of total_receipts, total_disbursements, and earliest opening_balance_id & date for this user and branch
    const sums = await CashDelivery.findOne({
      where: {
        user_id,
        branch_id,
      },
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_receipts')), 'total_receipts_sum'],
        [Sequelize.fn('SUM', Sequelize.col('total_disbursements')), 'total_disbursements_sum'],
        [Sequelize.fn('MIN', Sequelize.col('opening_balance_id')), 'opening_balance_id'], // earliest opening_balance_id
        [Sequelize.fn('MIN', Sequelize.col('date')), 'date'], // earliest date or adjust as needed
      ],
      raw: true,
    });

    if (!sums || !sums.opening_balance_id) {
      return res.status(404).json({ message: 'No deliveries found for user and branch' });
    }

    // Fetch the opening balance amount by opening_balance_id
    const openingBalanceRecord = await OpeningBalance.findByPk(sums.opening_balance_id);

    if (!openingBalanceRecord) {
      return res.status(404).json({ message: 'Opening balance record not found' });
    }

    const opening_balance = parseFloat(openingBalanceRecord.amount);
    const total_receipts = parseFloat(sums.total_receipts_sum) || 0;
    const total_disbursements = parseFloat(sums.total_disbursements_sum) || 0;
    const date = sums.date;

    return res.json({
      opening_balance_id: sums.opening_balance_id,
      opening_balance,
      total_receipts,
      total_disbursements,
      date,
    });
  } catch (error) {
    console.error('Error fetching cash summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createDelivery = async (req, res) => {
  try {
    const {
      delivered_amount,
      notes,
      date
    } = req.body;

    const user_id = req.user.id;
    const branch_id = req.user.branch_id;

    // ✅ 1. جلب الافتتاح المفتوح
    const opening = await OpeningBalance.findOne({
      where: {
        user_id,
        branch_id,
        is_previous_closed: false,
        deleted_at: null
      },
      order: [['created_at', 'DESC']]
    });

    if (!opening) {
      return res.status(400).json({ message: 'لم تقم بفتح كاش بعد.' });
    }

    // ✅ 2. تحقق من وجود مطابقة
    const matching = await CashMatching.findOne({
      where: {
        user_id,
        branch_id,
        opening_balance_id: opening.id
      }
    });

    if (!matching) {
      return res.status(400).json({ message: 'لم تقم بعملية المطابقة بعد.' });
    }

    // ✅ 3. إنشاء رقم تسليم
    const delivery_number = await generateDeliveryNumber();

    // ✅ 4. إنشاء السجل
    const delivery = await CashDelivery.create({
      delivery_number,
      total_receipts: matching.total_receipts,
      total_disbursements: matching.total_disbursements,
      delivered_amount,
      notes,
      date,
      user_id,
      branch_id,
      opening_balance_id: opening.id,
      is_verified: true,
      verified_by: user_id,
      verified_at: new Date()
    });

    // ✅ 5. إغلاق الافتتاح الحالي
    await opening.update({ is_previous_closed: true });

    return res.status(201).json(delivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ message: 'فشل في إنشاء التسليم', error: error.message });
  }
};



exports.getMatchedTotal = async (req, res) => {
  try {
    const { user_id, branch_id, date } = req.query;

    if (!user_id || !branch_id || !date) {
      return res.status(400).json({ message: 'يجب توفير user_id و branch_id و date' });
    }

    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Opening Balance (latest before or on the given date)
    const opening = await OpeningBalance.findOne({
      where: {
        user_id,
        branch_id,
        deleted_at: null,
        date: { [Op.lte]: endOfDay }
      },
      order: [['date', 'DESC']]
    });

    const openingAmount = opening ? parseFloat(opening.amount) : 0;

    // Receipts
    const receipts = await Receipt.findAll({
      where: {
        user_id,
        branch_id,
        created_at: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    // Disbursements
    const disbursements = await Disbursement.findAll({
      where: {
        user_id,
        branch_id,
        created_at: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const totalReceipts = receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalDisbursements = disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const expectedBalance = openingAmount + totalReceipts - totalDisbursements;

    res.status(200).json({
      opening_balance: openingAmount.toFixed(2),
      total_receipts: totalReceipts.toFixed(2),
      total_disbursements: totalDisbursements.toFixed(2),
      expected_balance: expectedBalance.toFixed(2)
    });
  } catch (error) {
    console.error('Error in getMatchedTotal:', error);
    res.status(500).json({ message: 'فشل في حساب الرصيد المتوقع' });
  }
};


exports.getMatchedConfirmationsForDate = async (req, res) => {
  try {
    const { user_id, branch_id, date } = req.query;

    if (!user_id || !branch_id || !date) {
      return res.status(400).json({ message: 'يجب تحديد user_id و branch_id و date' });
    }

    const matchings = await CashMatching.findAll({
      where: {
        user_id,
        branch_id,
        date,
      }
    });

    if (!matchings.length) {
      return res.status(404).json({ message: 'لا يوجد مطابقات لهذا اليوم' });
    }

    const total = matchings.reduce((sum, m) => sum + parseFloat(m.actual_total || 0), 0);

    res.json({ total: total.toFixed(2), count: matchings.length });
  } catch (error) {
    console.error('⚠️ Error in getMatchedConfirmationsForDate:', error);
    res.status(500).json({ message: 'فشل في تحميل المطابقات' });
  }
};


exports.getPendingDeliveries = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const results = await CashDelivery.findAll({
      where: {
        is_verified: true,
        is_collected: false,
        date: {
          [Op.lt]: today
        }
      },
      attributes: [
        'user_id',
        'branch_id',
        [Sequelize.fn('SUM', Sequelize.col('delivered_amount')), 'total_delivered']
      ],
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] }
      ],
      group: ['CashDelivery.user_id', 'CashDelivery.branch_id', 'user.id', 'branch.id']
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching pending deliveries:', error);
    res.status(500).json({ message: 'فشل في جلب السندات المتأخرة', error: error.message });
  }
};

exports.getTodayDeliveriesByStatus = async (req, res) => {
  try {
    const { date, branch_id } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const baseWhere = {
      is_verified: true,
      date: {
        [Op.gte]: targetDate,
        [Op.lt]: nextDay
      }
    };

    if (branch_id) {
      baseWhere.branch_id = branch_id;
    }

    const [collected, uncollected] = await Promise.all([
      CashDelivery.findAll({
        where: { ...baseWhere, is_collected: true },
        attributes: [
          'user_id',
          'branch_id',
          [Sequelize.fn('SUM', Sequelize.col('delivered_amount')), 'total_delivered']
        ],
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name'] },
          { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] }
        ],
        group: ['CashDelivery.user_id', 'CashDelivery.branch_id', 'user.id', 'branch.id']
      }),
      CashDelivery.findAll({
        where: { ...baseWhere, is_collected: false },
        attributes: [
          'user_id',
          'branch_id',
          [Sequelize.fn('SUM', Sequelize.col('delivered_amount')), 'total_delivered']
        ],
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name'] },
          { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] }
        ],
        group: ['CashDelivery.user_id', 'CashDelivery.branch_id', 'user.id', 'branch.id']
      })
    ]);

    res.json({
      collected,
      uncollected
    });

  } catch (error) {
    console.error('❌ Error in getTodayDeliveriesByStatus:', error);
    res.status(500).json({ message: 'فشل في جلب تسليمات اليوم', error: error.message });
  }
};

// exports.closeCashboxOnly = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const branchId = req.user.branch_id;
//     const today = new Date().toISOString().split('T')[0];

//     // Get approved matchings for today
//     const approvedMatchings = await CashMatching.findAll({
//       where: {
//         user_id: userId,
//         branch_id: branchId,
//         date: today,
//         //is_resolved: true
//       }
//     });

//     if (!approvedMatchings || approvedMatchings.length === 0) {
//       return res.status(400).json({ message: 'لا توجد مطابقات مالية معتمدة لإغلاق الصندوق' });
//     }

//     const deliveries = [];

//     for (const match of approvedMatchings) {
//       const newDelivery = await CashDelivery.create({
//         delivery_number: `CL-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 10)}`,
//         user_id: userId,
//         branch_id: branchId,
//         delivered_amount: match.actual_total,
//         total_receipts: null,
//         total_disbursements: null,
//         date: today,
//         notes: 'إغلاق صندوق بدون تسليم',
//         is_verified: false,
//         is_closed_only: true,
//         is_collected: false,
//         opening_balance_id: match.opening_balance_id
//       });

//       deliveries.push(newDelivery);
//     }

//     res.status(201).json({
//       message: 'تم إغلاق الصندوق بدون تسليم',
//       deliveries
//     });

//   } catch (error) {
//     console.error('Error closing cashbox:', error);
//     res.status(500).json({ message: 'فشل في إغلاق الصندوق', error: error.message });
//   }
// };


exports.closeCashboxOnly = async (req, res) => {
  try {
    const userId = req.user.id;
    const branchId = req.user.branch_id;
    const today = new Date().toISOString().split('T')[0];

    // جلب المطابقات لليوم الحالي
    const approvedMatchings = await CashMatching.findAll({
      where: {
        user_id: userId,
        branch_id: branchId,
        date: today,
      }
    });

    if (!approvedMatchings || approvedMatchings.length === 0) {
      return res.status(400).json({ message: 'لا توجد مطابقات مالية معتمدة لإغلاق الصندوق' });
    }

    const deliveries = [];

    for (const match of approvedMatchings) {
      // تحقق: هل يوجد تسليم سابق لهذه المطابقة؟
      const existing = await CashDelivery.findOne({
        where: {
          user_id: userId,
          branch_id: branchId,
          opening_balance_id: match.opening_balance_id
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'لا يمكنك إغلاق صندوق تم تسليمه مسبقًا' });
      }

      // إنشاء التسليم
      const newDelivery = await CashDelivery.create({
        delivery_number: `CL-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 10)}`,
        user_id: userId,
        branch_id: branchId,
        delivered_amount: match.actual_total,
        total_receipts: null,
        total_disbursements: null,
        date: today,
        notes: 'إغلاق صندوق بدون تسليم',
        is_verified: false,
        is_closed_only: true,
        is_collected: false,
        opening_balance_id: match.opening_balance_id
      });

      deliveries.push(newDelivery);

      // إغلاق الكاش المفتوح
      await OpeningBalance.update(
        { is_previous_closed: true },
        { where: { id: match.opening_balance_id } }
      );
    }

    res.status(201).json({
      message: 'تم إغلاق الصندوق بدون تسليم',
      deliveries
    });

  } catch (error) {
    console.error('Error closing cashbox:', error);
    res.status(500).json({ message: 'فشل في إغلاق الصندوق', error: error.message });
  }
};



exports.deliverClosedCash = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;

    const whereCondition = {
      user_id: userId,
      is_closed_only: true,
      is_verified: false,
    };

    if (id) {
      whereCondition.id = id;
    }

    const deliveries = await CashDelivery.findAll({ where: whereCondition });

    if (deliveries.length === 0) {
      return res.status(404).json({ message: id ? 'لم يتم العثور على السند المحدد' : 'لا توجد عهدة مغلقة قيد التسليم' });
    }

    const now = new Date();
    let updatedCount = 0;

    for (const delivery of deliveries) {
      delivery.is_closed_only = false;
      delivery.is_verified = true;
      delivery.verified_at = now;
      delivery.notes = (delivery.notes || '') + '\nتم تسليم العهدة المغلقة';
      await delivery.save();

      // تأكيد إغلاق الافتتاح المرتبط
      const opening = await OpeningBalance.findByPk(delivery.opening_balance_id);
      if (opening && !opening.is_previous_closed) {
        await opening.update({ is_previous_closed: true });
      }

      updatedCount++;
    }

    res.status(200).json({
      message: id ? '✅ تم تسليم السند بنجاح' : '✅ تم تسليم جميع العهدة المغلقة بنجاح',
      count: updatedCount
    });
  } catch (error) {
    console.error('Error delivering closed cash:', error);
    res.status(500).json({ message: 'فشل في تسليم العهدة', error: error.message });
  }
};
