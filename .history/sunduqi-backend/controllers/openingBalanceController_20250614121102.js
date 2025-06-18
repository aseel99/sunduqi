const { OpeningBalance, Branch, User, CashDelivery } = require('../models');
const { Op, UniqueConstraintError } = require('sequelize');
const { validationResult } = require('express-validator');
const { sequelize } = require('../models');

exports.getAllBalances = async (req, res) => {
  try {
    const { page = 1, limit = 10, branch_id, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (fromDate && toDate) {
      where.date = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const balances = await OpeningBalance.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] },
        { model: User, as: 'user', attributes: ['id', 'full_name'] }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: balances.count,
      page: parseInt(page),
      totalPages: Math.ceil(balances.count / limit),
      data: balances.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBalance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { branch_id, amount, date, notes } = req.body;
    const user_id = req.user.id;

    // Verify branch exists
    const branch = await Branch.findByPk(branch_id, { transaction });
    if (!branch) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Create balance
    const balance = await OpeningBalance.create({
      branch_id,
      user_id,
      amount: parseFloat(amount),
      date,
      notes: notes || null
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      data: {
        id: balance.id,
        amount: balance.amount,
        date: balance.date,
        branch_id: balance.branch_id,
        user_id: balance.user_id
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating opening balance:', error);

    // // Handle Sequelize unique constraint error (duplicate entry)
    // if (error instanceof UniqueConstraintError) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'An opening balance for this branch and date already exists.'
    //   });
    // }

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch or user reference'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getBalanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const balance = await OpeningBalance.findByPk(id, {
      include: [
        { model: Branch, as: 'branch' },
        { model: User, as: 'user' },
        { 
          model: CashDelivery, 
          as: 'cash_deliveries',
          attributes: ['id', 'delivery_number', 'date', 'delivered_amount'],
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!balance) {
      return res.status(404).json({ message: 'Opening balance not found' });
    }

    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, amount, date, notes } = req.body;

    const balance = await OpeningBalance.findByPk(id);
    if (!balance) {
      return res.status(404).json({ message: 'Opening balance not found' });
    }

    // Check if there are any cash deliveries associated with this balance
    const hasDeliveries = await CashDelivery.count({
      where: { opening_balance_id: id }
    });

    if (hasDeliveries > 0) {
      return res.status(400).json({ message: 'Cannot update balance with associated cash deliveries' });
    }

    await balance.update({
      branch_id: branch_id || balance.branch_id,
      amount: amount || balance.amount,
      date: date || balance.date,
      notes: notes || balance.notes
    });

    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
