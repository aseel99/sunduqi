const { CashMatching, Branch, User } = require('../models');
const { Receipt, Disbursement, OpeningBalance } = require('../models');
const { Op } = require('sequelize');

exports.getAllMatchings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      branch_id,
      user_id,
      is_resolved,
      fromDate,
      toDate,
      date,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // ✅ فلترة حسب التاريخ
    if (fromDate && toDate) {
      where.date = {
        [Op.between]: [fromDate, toDate]
      };
    } else if (date) {
      where.date = {
        [Op.between]: [date, date]
      };
    }

    // ✅ فلترة حسب الفرع
    if (branch_id) {
      where.branch_id = branch_id;
    }

    // ✅ فلترة حسب المستخدم حسب الدور
    if (req.user.role === 'admin') {
      if (user_id) {
        where.user_id = user_id;
      }
    } else {
      where.user_id = req.user.id;
    }

    // ✅ حالة المطابقة
    if (is_resolved !== undefined) {
      where.is_resolved = is_resolved === 'true';
    }

    // ✅ فلترة إضافية لإرجاع فقط الكاشير
    where['$user.role$'] = 'casher';

    const matchings = await CashMatching.findAndCountAll({
      where,
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name_ar'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'role'],
          required: true, // ✅ مهم حتى يعمل where['$user.role$']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'full_name'],
        },
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.json({
      total: matchings.count,
      page: parseInt(page),
      totalPages: Math.ceil(matchings.count / limit),
      data: matchings.rows,
    });

  } catch (error) {
    console.error('❌ Error in getAllMatchings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// exports.createMatching = async (req, res) => {
//   try {
//     const { branch_id, date, expected_total, actual_total, notes } = req.body;
//     const user_id = req.user.id;

//     const existing = await CashMatching.findOne({
//       where: { branch_id, date: new Date(date).toISOString().slice(0, 10) },
//     });

//     if (existing) {
//       return res.status(400).json({ message: 'تمت المطابقة لهذا الفرع في هذا التاريخ مسبقًا' });
//     }

//     const matching = await CashMatching.create({
//       branch_id,
//       user_id,
//       date,
//       expected_total,
//       actual_total,
//       notes,
//       is_resolved: false
//     });

//     res.status(201).json(matching);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.createMatching = async (req, res) => {
  try {
    const user_id = req.user.id;
    const branch_id = req.user.branch_id;
    const today = new Date().toISOString().split('T')[0];

    // ✅ 1. جلب آخر افتتاح غير مغلق قام به الكاشير بنفسه
    const opening = await OpeningBalance.findOne({
      where: {
        user_id,
        branch_id,
        is_previous_closed: false,
        deleted_at: null,
        date: { [Op.lte]: today }
      },
      order: [['created_at', 'DESC']]
    });

    if (!opening) {
      return res.status(400).json({ message: '⚠️ يجب فتح رصيد أولاً قبل المطابقة' });
    }

    const fromTime = opening.created_at;
    const toTime = new Date(); // لحظة الآن

    // ✅ 2. جمع المقبوضات (التي أدخلها الكاشير بنفسه فقط)
    const receipts = await Receipt.findAll({
      where: {
        user_id,
        branch_id,
        created_at: { [Op.between]: [fromTime, toTime] }
      }
    });
    const totalReceipts = receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    // ✅ 3. جمع المصروفات (من إدخال الكاشير فقط)
    const disbursements = await Disbursement.findAll({
      where: {
        user_id,
        branch_id,
        created_at: { [Op.between]: [fromTime, toTime] }
      }
    });
    const totalDisbursements = disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    const expectedTotal = parseFloat(opening.amount) + totalReceipts - totalDisbursements;

    // ✅ 4. منع التكرار في نفس اليوم
    const existing = await CashMatching.findOne({
      where: { user_id, branch_id, date: today }
    });

    if (existing) {
      return res.status(400).json({ message: '⚠️ تمت المطابقة مسبقًا لهذا اليوم' });
    }

    // ✅ 5. إنشاء المطابقة
    const match = await CashMatching.create({
      user_id,
      branch_id,
      date: today,
      expected_total: expectedTotal.toFixed(2),
      actual_total: expectedTotal.toFixed(2), // ← مؤقتًا، أو من المستخدم لاحقًا
      is_resolved: false
    });

    return res.status(201).json({
      message: '✅ تمت المطابقة بنجاح',
      match
    });

  } catch (error) {
    console.error('❌ Error in createMatching:', error);
    return res.status(500).json({ message: 'فشل في تنفيذ المطابقة', error: error.message });
  }
};


exports.getMatchingById = async (req, res) => {
  try {
    const { id } = req.params;

    const matching = await CashMatching.findByPk(id, {
      include: [
        { model: Branch, as: 'branch' },
        { model: User, as: 'user' },
        { model: User, as: 'resolver' }
      ]
    });

    if (!matching) {
      return res.status(404).json({ message: 'Matching not found' });
    }

    res.json(matching);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMatching = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, date, expected_total, actual_total, notes } = req.body;

    const matching = await CashMatching.findByPk(id);
    if (!matching) {
      return res.status(404).json({ message: 'Matching not found' });
    }

    if (matching.is_resolved) {
      return res.status(400).json({ message: 'Cannot update a resolved matching' });
    }

    await matching.update({
      branch_id: branch_id || matching.branch_id,
      date: date || matching.date,
      expected_total: expected_total || matching.expected_total,
      actual_total: actual_total || matching.actual_total,
      notes: notes || matching.notes
    });

    res.json(matching);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resolveMatching = async (req, res) => {
  try {
    const { id } = req.params;
    const resolved_by = req.user.id;

    const matching = await CashMatching.findByPk(id);
    if (!matching) {
      return res.status(404).json({ message: 'Matching not found' });
    }

    if (matching.is_resolved) {
      return res.status(400).json({ message: 'Matching already resolved' });
    }

    await matching.update({
      is_resolved: true,
      resolved_by,
      resolved_at: new Date()
    });

    res.json({ 
      message: 'Matching resolved successfully',
      is_resolved: matching.is_resolved 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getMatchingSummary = async (req, res) => {
  try {
    console.log('📥 getMatchingSummary hit with:', req.query);
    const { user_id, branch_id } = req.query;
    const today = new Date();
    const targetDate = today.toISOString().split('T')[0];

    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);

    // ✅ جلب كل أرصدة اليوم وما قبله
    const openingBalances = await OpeningBalance.findAll({
      where: {
        user_id,
        branch_id,
        deleted_at: null,
        date: { [Op.lte]: startOfDay },
      },
      order: [['date', 'ASC']], // اختياري للتنظيم فقط
    });

    // ✅ جمع كل الأرصدة
    const openingAmount = openingBalances.reduce(
      (sum, b) => sum + parseFloat(b.amount),
      0
    );

    // ✅ جلب الإيرادات
    const receipts = await Receipt.findAll({
      where: {
        user_id,
        branch_id,
        created_at: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    // ✅ جلب المصروفات
    const disbursements = await Disbursement.findAll({
      where: {
        user_id,
        branch_id,
        created_at: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    const totalReceipts = receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalDisbursements = disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const expectedTotal = openingAmount + totalReceipts - totalDisbursements;

    return res.status(200).json({
      total_receipts: totalReceipts.toFixed(2),
      total_disbursements: totalDisbursements.toFixed(2),
      opening_balance: openingAmount.toFixed(2),
      expected_total: expectedTotal.toFixed(2),
    });
  } catch (error) {
    console.error('Error in getMatchingSummary:', error);
    return res.status(500).json({ message: 'Failed to calculate summary', error: error.message });
  }
};



exports.getBranchTotals = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id'],
        },
      ],
    });

    const result = [];

    for (const branch of branches) {
      let totalReceipts = 0;
      let totalDisbursements = 0;
      let totalOpening = 0;

      for (const user of branch.users) {
        const receipts = await Receipt.findAll({ where: { branch_id: branch.id, user_id: user.id } });
        const disbursements = await Disbursement.findAll({ where: { branch_id: branch.id, user_id: user.id } });
        const openingBalance = await OpeningBalance.findOne({
          where: { branch_id: branch.id, user_id: user.id },
          order: [['date', 'DESC']],
        });

        totalReceipts += receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        totalDisbursements += disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        if (openingBalance) totalOpening += parseFloat(openingBalance.amount);
      }

      result.push({
        branch_id: branch.id,
        branch_name: branch.name_ar,
        total_receipts: totalReceipts.toFixed(2),
        total_disbursements: totalDisbursements.toFixed(2),
        opening_balance: totalOpening.toFixed(2),
        expected_total: (totalOpening + totalReceipts - totalDisbursements).toFixed(2),
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in getBranchTotals:', error);
    return res.status(500).json({ message: 'فشل في تحميل المجاميع لكل الفروع' });
  }
};

exports.adminConfirmMatches = async (req, res) => {
  try {
    const { user_id, branch_id, expected_total, actual_total, notes, date } = req.body;

    console.log('📥 BODY RECEIVED FROM FRONTEND:', req.body);

    await CashMatching.create({
      user_id,
      branch_id,
      expected_total,
      actual_total,
      notes,
      date: date || new Date().toISOString().split('T')[0], // 👈 افتراضي إذا لم يُرسل
    });

    res.status(200).json({ message: 'تم حفظ المطابقة بنجاح' });
  } catch (error) {
    console.error('❌ Error saving admin match:', error);
    res.status(500).json({ message: 'فشل في حفظ المطابقة', error: error.message });
  }
};
exports.cashierConfirmMatch = async (req, res) => {
  try {
    const { user_id, branch_id, expected_total, actual_total, notes, date } = req.body;

    // const existing = await CashMatching.findOne({
    //   where: { user_id, branch_id, date }
    // });

    // if (existing) {
    //   return res.status(400).json({ message: 'تمت المطابقة بالفعل لهذا التاريخ' });
    // }

    const match = await CashMatching.create({
      user_id,
      branch_id,
      expected_total,
      actual_total,
      notes,
      date,
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Cashier confirm error:', error);
    res.status(500).json({ message: 'فشل حفظ المطابقة' });
  }
};

