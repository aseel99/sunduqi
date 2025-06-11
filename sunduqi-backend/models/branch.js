module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    name_ar: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    name_en: {
      type: DataTypes.STRING(100)
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'branches'
  });

  Branch.associate = (models) => {
    Branch.hasMany(models.User, {
      foreignKey: 'branch_id',
      as: 'users'
    });
    
    Branch.hasMany(models.OpeningBalance, {
      foreignKey: 'branch_id',
      as: 'opening_balances'
    });
    
    Branch.hasMany(models.CashDelivery, { 
    foreignKey: 'branch_id',
     as: 'cash_deliveries' });

  };

  return Branch;
};