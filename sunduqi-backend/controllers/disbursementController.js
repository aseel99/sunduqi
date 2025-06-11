const { Disbursement, Branch, User } = require('../models');
const { Op } = require('sequelize');
const { generateDisbursementNumber } = require('../utils/generators');

exports.getAllDisbursements = async (req, res) => {
  try {
    const { page = 1, limit = 10, branch_id, is_approved, payment_method, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (is_approved !== undefined) {
      where.is_approved = is_approved === 'true';
    }

    if (payment_method) {
      where.payment_method = payment_method;
    }

    if (fromDate && toDate) {
      where.created_at = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const disbursements = await Disbursement.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] },
        { model: User, as: 'user', attributes: ['id', 'full_name'] },
        { model: User, as: 'approver', attributes: ['id', 'full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: disbursements.count,
      page: parseInt(page),
      totalPages: Math.ceil(disbursements.count / limit),
      data: disbursements.rows,
    });
  } catch (error) {
    console.error('Error in getAllDisbursements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDisbursement = async (req, res) => {
  try {
    const {
      branch_id,
      amount,
      payment_method,
      recipient_name,
      notes
    } = req.body;

    const user_id = req.user.id;

    // multer saves uploaded file info to req.file
    const attachment_url = req.file ? `/uploads/${req.file.filename}` : null;

    const disbursementNumber = await generateDisbursementNumber();

    const disbursement = await Disbursement.create({
      disbursement_number: disbursementNumber,
      user_id,
      branch_id: parseInt(branch_id),
      amount: parseFloat(amount),
      payment_method,
      recipient_name,
      attachment_url,
      notes
    });

    res.status(201).json(disbursement);
  } catch (error) {
    console.error('Error in createDisbursement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDisbursementById = async (req, res) => {
  try {
    const { id } = req.params;

    const disbursement = await Disbursement.findByPk(id, {
      include: [
        { model: Branch, as: 'branch' },
        { model: User, as: 'user' },
        { model: User, as: 'approver' }
      ]
    });

    if (!disbursement) {
      return res.status(404).json({ message: 'Disbursement not found' });
    }

    res.json(disbursement);
  } catch (error) {
    console.error('Error in getDisbursementById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDisbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, amount, payment_method, recipient_name, attachment_url, notes } = req.body;

    const disbursement = await Disbursement.findByPk(id);
    if (!disbursement) {
      return res.status(404).json({ message: 'Disbursement not found' });
    }

    if (disbursement.is_approved) {
      return res.status(400).json({ message: 'Cannot update an approved disbursement' });
    }

    await disbursement.update({
      branch_id: branch_id || disbursement.branch_id,
      amount: amount || disbursement.amount,
      payment_method: payment_method || disbursement.payment_method,
      recipient_name: recipient_name || disbursement.recipient_name,
      attachment_url: attachment_url || disbursement.attachment_url,
      notes: notes || disbursement.notes
    });

    res.json(disbursement);
  } catch (error) {
    console.error('Error in updateDisbursement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveDisbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.id;

    const disbursement = await Disbursement.findByPk(id);
    if (!disbursement) {
      return res.status(404).json({ message: 'Disbursement not found' });
    }

    if (disbursement.is_approved) {
      return res.status(400).json({ message: 'Disbursement already approved' });
    }

    await disbursement.update({
      is_approved: true,
      approved_by,
      approved_at: new Date()
    });

    res.json({ 
      message: 'Disbursement approved successfully',
      is_approved: true
    });
  } catch (error) {
    console.error('Error in approveDisbursement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
