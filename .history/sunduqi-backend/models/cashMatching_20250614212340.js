module.exports = (sequelize, DataTypes) => {
  const CashMatching = sequelize.define('CashMatching', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    expected_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    actual_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT
    },
    is_resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    opening_balance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'opening_balances',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },

  }, {
    tableName: 'cash_matching',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associations will be set up in models/index.js
  CashMatching.associate = function(models) {
    CashMatching.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    
    CashMatching.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    CashMatching.belongsTo(models.User, {
      foreignKey: 'resolved_by',
      as: 'resolver'
    });
  };

  return CashMatching;
};