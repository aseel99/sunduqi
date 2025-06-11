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

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🔧 Initializing application...');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);

// ✅ قائمة الدومينات المسموح بها
const allowedOrigins = [
  'https://sunduqi-g1ho0dklr-aseel99s-projects.vercel.app',
  'https://sunduqi.vercel.app',
  'http://localhost:5173'
];

// ✅ إعداد CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ CORS configured');

app.use(helmet());
console.log('✅ Security headers enabled');

if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  console.log('✅ Request logging enabled');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsers configured');

app.use('/uploads', express.static('uploads'));
console.log('🔄 Loading routes...');
app.use('/api', routes);
console.log('✅ Routes mounted at /api');

// Error handling
app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;
  console.error('❗ Error:', err.message, err.stack);
  res.status(err.statusCode).json({ success: false, message: err.message });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

app.use(errorHandler);
console.log('✅ Error handler configured');

// DB and server start
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
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        db.sequelize.close()
          .then(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
          })
          .catch(err => {
            console.error('❌ Error closing DB:', err);
            process.exit(1);
          });
      });
    });
  })
  .catch(err => {
    console.error('❌ Startup error:', err);
    process.exit(1);
  });

module.exports = app;
