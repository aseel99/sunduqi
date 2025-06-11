module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    related_table: {
      type: DataTypes.STRING(30)
    },
    related_id: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'notifications',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['is_read']
      }
    ]
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Notification;
};