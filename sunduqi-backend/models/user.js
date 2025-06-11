module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(200)
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'casher'),
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associations will be set up in models/index.js
  User.associate = function(models) {
    User.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
  };

  return User;
};