const { User, Branch, Receipt, Disbursement } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, branch_id, is_active } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] }
      ],
      order: [['full_name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit),
      data: users.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role, branch_id } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash: hashedPassword,
      full_name,
      email,
      role,
      branch_id
    });

    // Exclude password_hash from the response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Branch, as: 'branch' },
        { 
          model: Receipt, 
          as: 'receipts',
          attributes: ['id', 'receipt_number', 'amount', 'created_at'],
          order: [['created_at', 'DESC']],
          limit: 5
        },
        {
          model: Disbursement,
          as: 'disbursements',
          attributes: ['id', 'disbursement_number', 'amount', 'created_at'],
          order: [['created_at', 'DESC']],
          limit: 5
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, branch_id, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {
      full_name: full_name || user.full_name,
      email: email || user.email,
      role: role || user.role,
      branch_id: branch_id !== undefined ? branch_id : user.branch_id
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Exclude password_hash from the response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    await user.update({ is_active: !user.is_active });

    res.json({ 
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: user.is_active 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a simple temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await user.update({ password_hash: hashedPassword });

    res.json({ 
      success: true,
      message: 'Password reset successfully',
      tempPassword // In production, you'd send this via email instead
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};