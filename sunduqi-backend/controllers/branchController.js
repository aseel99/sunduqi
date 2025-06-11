const { Branch, User, OpeningBalance, CashDelivery } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');


exports.getAllBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name_ar: { [Op.like]: `%${search}%` } },
        { name_en: { [Op.like]: `%${search}%` } }
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const branches = await Branch.findAndCountAll({
      where,
      order: [['name_ar', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: branches.count,
      page: parseInt(page),
      totalPages: Math.ceil(branches.count / limit),
      data: branches.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { name_ar, name_en, is_active = true } = req.body;

    const branch = await Branch.create({
      name_ar,
      name_en,
      is_active
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'users',
          attributes: ['id', 'full_name', 'username', 'email', 'role', 'is_active'],
          where: { is_active: true },
          required: false
        },
        {
          model: OpeningBalance,
          as: 'opening_balances',
          order: [['date', 'DESC']],
          limit: 5,
          required: false
        },
        {
          model: CashDelivery,
          as: 'cash_deliveries',
          order: [['date', 'DESC']],
          limit: 5,
          required: false
        }
      ]
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, is_active } = req.body;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.update({
      name_ar: name_ar || branch.name_ar,
      name_en: name_en || branch.name_en,
      is_active: is_active !== undefined ? is_active : branch.is_active
    });

    res.json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleBranchActive = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.update({ is_active: !branch.is_active });

    res.json({ 
      message: `Branch ${branch.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: branch.is_active 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getBranchTotals = async (req, res) => {
  try {
    const { fromDate, toDate, branch_id } = req.query;

    // إذا لم يتم تحديد التاريخ، نستخدم تاريخ اليوم كنقطة بداية ونهاية
    const today = new Date().toISOString().slice(0, 10);
    const start = fromDate || today;
    const end = toDate || today;

    const replacements = { fromDate: start, toDate: end };

    const receiptsDateFilter = `AND DATE(r.created_at) BETWEEN :fromDate AND :toDate`;
    const disbursementsDateFilter = `AND DATE(d.created_at) BETWEEN :fromDate AND :toDate`;

    const branchFilter = branch_id ? `AND b.id = :branch_id` : '';
    if (branch_id) replacements.branch_id = branch_id;

    const [results] = await sequelize.query(
      `
      SELECT
        b.id AS branch_id,
        b.name_ar AS branch_name,
        COALESCE((
          SELECT SUM(r.amount)
          FROM receipts r
          WHERE r.branch_id = b.id
          ${receiptsDateFilter}
        ), 0) AS total_receipts,
        COALESCE((
          SELECT SUM(d.amount)
          FROM disbursements d
          WHERE d.branch_id = b.id
          ${disbursementsDateFilter}
        ), 0) AS total_disbursements
      FROM branches b
      WHERE b.is_active = true
      ${branchFilter}
      ORDER BY b.name_ar
    `,
      { replacements }
    );

    res.json(results);
  } catch (err) {
    console.error('Error fetching branch totals:', err);
    res.status(500).json({ message: 'Failed to fetch branch totals' });
  }
};
