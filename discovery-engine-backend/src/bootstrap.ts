/**
 * ============================================================================
 * DISCOVERY ENGINE - Backend API Server
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import blueprintRoutes from './routes/blueprint';
import paymentsRoutes from './routes/payments';
import { webhookHandler } from './controllers/paymentController';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initDb } from './db';

console.log('[BOOTSTRAP] Starting app initialization...');
console.log('[BOOTSTRAP] NODE_ENV:', process.env.NODE_ENV);
console.log('[BOOTSTRAP] DATABASE_URL set:', !!process.env.DATABASE_URL);

// Validate configuration
validateConfig();

// ---------------------------------------------------------------------------
// Express App Setup
// ---------------------------------------------------------------------------

const app = express();
app.set('trust proxy', 1);

// Security: Set HTTP headers
app.use(helmet());

// CORS: Allow requests from frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.isDevelopment && origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      if (config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  })
);

// Webhook route MUST use raw body for signature verification
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// ---------------------------------------------------------------------------
// Health Check (no rate limit)
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'discovery-engine-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ---------------------------------------------------------------------------
// Database Initialization (lazy on first request for serverless)
// ---------------------------------------------------------------------------
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    console.log('[DB] Initializing database...');
    try {
      await initDb();
      dbInitialized = true;
      console.log('[DB] Database initialized successfully');
    } catch (err) {
      console.error('[DB] Initialization failed:', err);
      return res.status(500).json({ success: false, message: 'Database unavailable' });
    }
  }
  next();
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blueprint', blueprintRoutes);
app.use('/api/payments', paymentsRoutes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Local Development Server
// ---------------------------------------------------------------------------

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     DISCOVERY ENGINE API — Backend Server                    ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Port:        ${config.port.toString().padEnd(49)} ║`);
    console.log(`║  Environment: ${config.nodeEnv.padEnd(49)} ║`);
    console.log(`║  Health:      http://localhost:${config.port}/health${' '.repeat(24 - config.port.toString().length)}║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
  });
}

export default app;
