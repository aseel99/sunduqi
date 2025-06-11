// models/BankTransfer.js
module.exports = (sequelize, DataTypes) => {
  const BankTransfer = sequelize.define('BankTransfer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_receipts: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_disbursements: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    final_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transferred_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transferred_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'bank_transfers',
    timestamps: false,
  });

  BankTransfer.associate = (models) => {
    BankTransfer.belongsTo(models.Branch, { foreignKey: 'branch_id', as: 'branch' });
    BankTransfer.belongsTo(models.User, { foreignKey: 'transferred_by', as: 'user' });
  };

  return BankTransfer;
};
