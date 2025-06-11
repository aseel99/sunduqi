module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    table_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    record_id: {
      type: DataTypes.INTEGER
    },
    old_values: {
      type: DataTypes.JSONB
    },
    new_values: {
      type: DataTypes.JSONB
    },
    ip_address: {
      type: DataTypes.STRING(45)
    },
    user_agent: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'audit_log',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['table_name']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuditLog;
};