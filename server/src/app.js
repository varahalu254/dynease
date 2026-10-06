const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const publicRoutes = require('./routes/publicRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

// Trust reverse proxy for rate limiter (Hostinger uses Nginx/LiteSpeed)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
const allowedOrigins = ['http://localhost:5173', 'http://admin.localhost:5173', 'https://dynease.in'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost, main domain, and any subdomain
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.dynease.in') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

const path = require('path');

const tenantResolver = require('./middlewares/tenantResolver');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly.' });
});

// Mount Routes
app.use('/api/admin', adminRoutes);

// Apply tenantResolver to APIs that need tenant context
app.use('/api/auth', tenantResolver, authRoutes);

// Apply tenantResolver to APIs that need tenant context
app.use('/api/restaurant', tenantResolver, restaurantRoutes);
app.use('/api/restaurant/tables', tenantResolver, tableRoutes);
app.use('/api/restaurant/staff', tenantResolver, staffRoutes);
app.use('/api/public', tenantResolver, publicRoutes);

// Serve React App for any unknown non-api routes (SPA fallback)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
