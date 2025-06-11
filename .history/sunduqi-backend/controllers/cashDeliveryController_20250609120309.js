const { CashDelivery, Branch, User, OpeningBalance, CashMatching, Receipt, Disbursement } = require('../models');
const { generateDeliveryNumber } = require('../utils/generators');
const { Op, Sequelize } = require('sequelize');


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
    const { total_receipts, total_disbursements, delivered_amount, notes, date, opening_balance_id } = req.body;
    const user_id = req.user.id;
    const branch_id = req.user.branch_id;

    const delivery_number = await generateDeliveryNumber();

    const delivery = await CashDelivery.create({
      delivery_number,
      total_receipts,
      total_disbursements,
      delivered_amount,
      notes,
      date,
      user_id,
      branch_id,
      opening_balance_id
    });

    res.status(201).json(delivery);
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


exports.getMatchedConfirmedTotal = async (req, res) => {
  try {
    const { user_id, branch_id, date } = req.query;

    const match = await CashMatching.findOne({
      where: {
        user_id,
        branch_id,
        date: new Date(date).toISOString().slice(0, 10)
      }
    });

    if (!match) {
      return res.status(404).json({ message: 'لا يوجد تطابق نقدي لهذا التاريخ' });
    }

    res.status(200).json({ actual_total: match.actual_total });
  } catch (error) {
    console.error('Error fetching matched total:', error);
    res.status(500).json({ message: 'فشل في جلب التطابق النقدي', error: error.message });
  }
};
