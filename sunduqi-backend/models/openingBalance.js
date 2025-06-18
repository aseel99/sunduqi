
module.exports = (sequelize, DataTypes) => {
  const OpeningBalance = sequelize.define('OpeningBalance', {
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'Amount is required' },
        isDecimal: { msg: 'Amount must be a decimal number' },
        min: { args: [0.01], msg: 'Amount must be greater than 0' }
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: 'Date is required' },
        isDate: { msg: 'Invalid date format' }
      }
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Branch ID is required' }
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'User ID is required' }
      }
    },
    notes: {
      type: DataTypes.TEXT
    },
    is_previous_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }

  }, {
    tableName: 'opening_balances',
    timestamps: true,
    paranoid: true // Enable soft deletion
  });

  OpeningBalance.associate = (models) => {
    OpeningBalance.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch',
      onDelete: 'RESTRICT'
    });
    
    OpeningBalance.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'RESTRICT'
    });
    
    OpeningBalance.hasMany(models.CashDelivery, {
      foreignKey: 'opening_balance_id',
      as: 'cash_deliveries',
      onDelete: 'CASCADE'
    });
  };

  return OpeningBalance;
};