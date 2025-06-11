module.exports = (sequelize, DataTypes) => {
  const CashDelivery = sequelize.define('CashDelivery', {
    delivery_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    total_receipts: {
      type: DataTypes.DECIMAL(12, 2)
    },
    total_disbursements: {
      type: DataTypes.DECIMAL(12, 2)
    },
    delivered_amount: {
      type: DataTypes.DECIMAL(12, 2)
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verified_at: {
      type: DataTypes.DATE
    },
    is_collected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'cash_deliveries'
  });

  CashDelivery.associate = (models) => {
    CashDelivery.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    CashDelivery.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    
    CashDelivery.belongsTo(models.OpeningBalance, {
      foreignKey: 'opening_balance_id',
      as: 'opening_balance'
    });
    
    CashDelivery.belongsTo(models.User, {
      foreignKey: 'verified_by',
      as: 'verifier'
    });
    CashDelivery.belongsTo(models.Branch, {
       foreignKey: 'branch_id', 
       as: 'delivery_branch' });

  };
   
  return CashDelivery;
};