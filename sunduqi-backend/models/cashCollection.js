module.exports = (sequelize, DataTypes) => {
  const CashCollection = sequelize.define('CashCollection', {
    collection_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    collection_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_collected: {
      type: DataTypes.DECIMAL(12, 2)
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
    }
  }, {
    tableName: 'cash_collections'
  });

  CashCollection.associate = (models) => {
    CashCollection.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    
    CashCollection.belongsTo(models.User, {
      foreignKey: 'collected_by',
      as: 'collector'
    });
    
    CashCollection.belongsTo(models.User, {
      foreignKey: 'verified_by',
      as: 'verifier'
    });
  };

  return CashCollection;
};