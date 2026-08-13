import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB, getPool, initializeTables } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { roleMiddleware } from './middleware/role.js';

import ordersRouter from './routes/orders.js';
import inventoryRouter from './routes/inventory.js';
import customersRouter from './routes/customers.js';
import metricsRouter from './routes/metrics.js';
import chartRouter from './routes/chart.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

// Trust Railway's reverse proxy for accurate IP detection in rate limiting
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authLimiter, authRouter);

// Protected routes
app.use('/api/orders', authMiddleware, ordersRouter);
app.use('/api/inventory', authMiddleware, inventoryRouter);
app.use('/api/customers', authMiddleware, customersRouter);
app.use('/api/metrics', authMiddleware, metricsRouter);
app.use('/api/chart', authMiddleware, chartRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
async function start() {
  try {
    await connectDB();
    await initializeTables();
    app.listen(PORT, () => {
      console.log(`🚀 OrderLink Backend API running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS Origin: ${corsOrigin}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;