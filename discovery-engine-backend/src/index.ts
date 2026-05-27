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
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
  console.log('║  Available Endpoints:                                        ║');
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
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
