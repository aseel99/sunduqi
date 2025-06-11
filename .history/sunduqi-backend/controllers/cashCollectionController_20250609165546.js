const { CashCollection, CashDelivery, Branch, User  } = require('../models');
const { Sequelize, Op } = require('sequelize');

const { generateCollectionNumber } = require('../utils/generators');


exports.getAllCollections = async (req, res) => {
  try {
    const { page = 1, limit = 10, branch_id, is_verified, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (is_verified !== undefined) {
      where.is_verified = is_verified === 'true';
    }

    if (fromDate && toDate) {
      where.collection_date = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const collections = await CashCollection.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar'] },
        { model: User, as: 'collector', attributes: ['id', 'full_name'] },
        { model: User, as: 'verifier', attributes: ['id', 'full_name'] }
      ],
      order: [['collection_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: collections.count,
      page: parseInt(page),
      totalPages: Math.ceil(collections.count / limit),
      data: collections.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createCollection = async (req, res) => {
  try {
    const { branch_id, user_id, total_amount } = req.body;
    const admin_id = req.user.id;

    const collection = await CashCollection.create({
      branch_id,
      user_id,
      total_amount,
      collected_by: admin_id,
      collection_date: new Date(),
      is_collected: true // ✅ حفظ الحالة
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ message: 'فشل في إنشاء الاستلام', error: error.message });
  }
};


exports.getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await CashCollection.findByPk(id, {
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name_ar', 'name_en'] },
        { model: User, as: 'collector', attributes: ['id', 'full_name', 'username'] },
        { model: User, as: 'verifier', attributes: ['id', 'full_name', 'username'] }
      ]
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, collection_date, total_collected, notes } = req.body;

    const collection = await CashCollection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.is_verified) {
      return res.status(400).json({ message: 'Cannot update a verified collection' });
    }

    await collection.update({
      branch_id: branch_id || collection.branch_id,
      collection_date: collection_date || collection.collection_date,
      total_collected: total_collected || collection.total_collected,
      notes: notes || collection.notes
    });

    res.json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const verified_by = req.user.id;

    const collection = await CashCollection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.is_verified) {
      return res.status(400).json({ message: 'Collection already verified' });
    }

    await collection.update({
      is_verified: true,
      verified_by,
      verified_at: new Date()
    });

    res.json({ 
      message: 'Collection verified successfully',
      is_verified: collection.is_verified 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get grouped deliveries per user and branch for today
exports.getGroupedDeliveries = async (req, res) => {
  try {
    const { date } = req.query;

    const deliveries = await CashDelivery.findAll({
      attributes: [
        'user_id',
        'branch_id',
        [Sequelize.fn('SUM', Sequelize.col('delivered_amount')), 'total_delivered']
      ],
      where: {
        date,
        is_verified: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name_ar']
        }
      ],
      group: [
        'CashDelivery.user_id',
        'CashDelivery.branch_id',
        'user.id',
        'user.full_name',
        'branch.id',
        'branch.name_ar'
      ]
    });

    res.status(200).json(deliveries);
  } catch (error) {
    console.error('Error in getGroupedDeliveries:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب التجميع', error: error.message });
  }
};