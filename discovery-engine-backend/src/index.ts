/**
 * ============================================================================
 * DISCOVERY ENGINE - Backend API Server
 * ============================================================================
 * Express.js server with:
 *   - Security middleware (helmet, CORS, rate limiting)
 *   - Request logging (morgan)
 *   - JSON body parsing
 *   - API routes for auth, user, and blueprint
 *   - Global error handling
 *
 * Start: npm run dev  (uses nodemon + ts-node)
 * Build: npm run build (compiles TypeScript to dist/)
 * Serve: npm start     (runs compiled JS from dist/)
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
import './db'; // Initialize SQLite database

// Validate configuration
validateConfig();

// ---------------------------------------------------------------------------
// Express App Setup
// ---------------------------------------------------------------------------

const app = express();

// Security: Set HTTP headers
app.use(helmet());

// CORS: Allow requests from frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In development, allow any localhost origin
      if (config.isDevelopment && origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      // Check against configured origins
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

// Webhook route MUST use raw body for signature verification (before express.json())
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
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blueprint', blueprintRoutes);
app.use('/api/payments', paymentsRoutes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     DISCOVERY ENGINE API — Backend Server                    ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Port:        ${config.port.toString().padEnd(49)} ║`);
  console.log(`║  Environment: ${config.nodeEnv.padEnd(49)} ║`);
  console.log(`║  Health:      http://localhost:${config.port}/health${' '.repeat(24 - config.port.toString().length)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Auth Endpoints:                                        ║');
  console.log('║    POST /api/auth/register                                   ║');
  console.log('║    POST /api/auth/login                                      ║');
  console.log('║    GET  /api/user/me                                         ║');
  console.log('║    PUT  /api/user/profile                                    ║');
  console.log('║    GET  /api/user/credits                                    ║');
  console.log('║    GET  /api/blueprint                                       ║');
  console.log('║    POST /api/blueprint/niche                                 ║');
  console.log('║    POST /api/blueprint/audience                              ║');
  console.log('║    POST /api/blueprint/problems                              ║');
  console.log('║    POST /api/blueprint/program-name                          ║');
  console.log('║    POST /api/blueprint/pricing                               ║');
  console.log('║    POST /api/blueprint/roadmap                               ║');
  console.log('║    GET  /api/blueprint/pdf/:id                               ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Payment Endpoints:                                          ║');
  console.log('║    GET  /api/payments/packages                               ║');
  console.log('║    POST /api/payments/create-order                           ║');
  console.log('║    POST /api/payments/verify                                 ║');
  console.log('║    POST /api/payments/webhook                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  if (config.isRazorpayTestMode) {
    console.log('⚠️  [Razorpay] Running in TEST mode. No real money will be processed.');
  } else if (config.razorpayKeyId) {
    console.log('💰 [Razorpay] Running in LIVE mode. Real payments will be processed!');
  } else {
    console.log('⚠️  [Razorpay] Not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  console.log('');
});

export default app;
