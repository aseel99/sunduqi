require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// Environment setup
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🔧 Initializing application...');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);

// Logging each request method + URL
app.use((req, res, next) => {
  console.log(`🛣️  ${req.method} ${req.url}`);
  next();
});

// ✅ CORS configuration (allow all or from environment)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ CORS configured');

// ✅ Add security headers
app.use(helmet());
console.log('✅ Security headers enabled');

// ✅ Request logging (disabled in test env)
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  console.log('✅ Request logging enabled');
}

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsers configured');

// ✅ Static files for uploads
app.use('/uploads', express.static('uploads'));

// ✅ Mount routes under /api
console.log('🔄 Loading routes...');
app.use('/api', routes);
console.log('✅ Routes mounted at /api');

// ✅ Disable caching for API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// ✅ Centralized error handler
app.use(errorHandler);
console.log('✅ Error handler configured');

// ✅ Database connection and server startup
console.log('🔗 Connecting to database...');
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');

    const syncOptions = {
      alter: NODE_ENV === 'development',
      force: false,
      logging: console.log
    };

    return db.sequelize.sync(syncOptions);
  })
  .then(() => {
    console.log('🔄 Database models synchronized');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${NODE_ENV}`);
    });

    // ✅ Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        db.sequelize.close()
          .then(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
          })
          .catch(err => {
            console.error('❌ Error closing database connection:', err);
            process.exit(1);
          });
      });
    });
  })
  .catch(err => {
    console.error('❌ Fatal error during startup:', err);
    process.exit(1);
  });

module.exports = app;
