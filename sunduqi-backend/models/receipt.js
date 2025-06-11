module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
    receipt_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'visa', 'transfer'),
      allowNull: false
    },
    attachment_url: {
      type: DataTypes.TEXT
    },
    client_name: {
      type: DataTypes.STRING(200)
    },
    notes: {
      type: DataTypes.TEXT
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approved_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'receipts'
  });

  Receipt.associate = (models) => {
    Receipt.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Receipt.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    
    Receipt.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
  };

  return Receipt;
};