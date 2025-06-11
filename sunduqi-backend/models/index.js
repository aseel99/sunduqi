const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

console.log(`Initializing Sequelize with ${env} configuration...`);

const sequelize = new Sequelize(
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

// Load all models
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
    const modelPath = path.join(__dirname, file);
    console.log(`Loading model: ${file}`);
    const model = require(modelPath)(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations after all models are loaded
console.log('Setting up associations...');
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    console.log(`Setting associations for ${modelName}`);
    db[modelName].associate(db);
  }
});

// Add sync function with error handling
db.sync = async (options = {}) => {
  try {
    console.log('Syncing database...');
    await sequelize.sync(options);
    console.log('Database sync completed successfully');
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;