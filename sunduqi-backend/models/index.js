const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const basename = path.basename(__filename);
const db = {};

console.log('Initializing Sequelize from DATABASE_URL...');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false
  }
});

// Load all model files in this folder
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sync = async (options = {}) => {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync(options);
    console.log('✅ Database synced!');
  } catch (error) {
    console.error('❌ Sync error:', error);
    throw error;
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
