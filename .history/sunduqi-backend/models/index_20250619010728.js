const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;

// Use DATABASE_URL in production (e.g. Render) with SSL
if (process.env.DATABASE_URL) {
  console.log('🌐 Connecting to DATABASE_URL...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
} else {
  // Local development using config/config.js
  console.log(`🔧 Connecting using config.js for env: ${env}`);
  const config = require(__dirname + '/../config/config.js')[env];
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Load all model files in this folder dynamically
fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Custom sync method
db.sync = async (options = {}) => {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync(options);
    console.log('✅ Database sync complete');
  } catch (err) {
    console.error('❌ Sync error:', err);
    throw err;
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
