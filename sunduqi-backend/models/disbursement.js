module.exports = (sequelize, DataTypes) => {
  const Disbursement = sequelize.define('Disbursement', {
    disbursement_number: {
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
    recipient_name: {
      type: DataTypes.STRING(200)
    },
    attachment_url: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    },
    printable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approved_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'disbursements'
  });

  Disbursement.associate = (models) => {
    Disbursement.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Disbursement.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    
    Disbursement.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
  };

  return Disbursement;
};