/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Configuration
 * ============================================================================
 * Centralized auth constants loaded from environment variables.
 * ============================================================================
 */

import { config } from './index';

export const authConfig = {
  jwtSecret: config.jwtSecret,
  jwtExpiresIn: config.jwtExpiresIn,
  bcryptRounds: 12,
  resetTokenExpiryHours: 1,
  resetTokenBytes: 32,
};

export const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: process.env.SMTP_FROM_NAME || 'Discovery Engine',
  fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@discoveryengine.app',
};
