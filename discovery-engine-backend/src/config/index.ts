/**
 * ============================================================================
 * DISCOVERY ENGINE - Environment Configuration
 * ============================================================================
 * Centralized config loaded from environment variables.
 * Provides defaults for development and validates required variables.
 * ============================================================================
 */

import dotenv from 'dotenv';

// Load .env file
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envPath });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ],

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // LLM API Keys (optional — for future integration)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  cohereApiKey: process.env.COHERE_API_KEY || '',

  // JWT (for future auth integration)
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Database (for future integration)
  databaseUrl: process.env.DATABASE_URL || '',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',

  // Call booking link (embedded in generated PDF)
  bookingLink: process.env.BOOKING_LINK || 'https://discoveryengine.app/book',

  // Razorpay payment integration
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // Derived
  isRazorpayTestMode: (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_'),
};

/**
 * Validate required configuration
 */
export const validateConfig = (): void => {
  if (config.isProduction) {
    if (config.jwtSecret === 'dev-secret-change-in-production') {
      console.warn('[Config] WARNING: Using default JWT secret in production!');
    }
    if (!config.databaseUrl) {
      console.warn('[Config] WARNING: DATABASE_URL not set in production!');
    }
  }
};
