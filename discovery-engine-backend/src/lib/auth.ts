/**
 * ============================================================================
 * DISCOVERY ENGINE - Authentication Utilities
 * ============================================================================
 * Password hashing, JWT generation/verification, and token helpers.
 * ============================================================================
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config/auth';
import type { User } from '../types';

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, authConfig.bcryptRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT tokens
// ---------------------------------------------------------------------------

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(user: Pick<User, 'id' | 'email'>): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwtSecret) as TokenPayload;
}

// ---------------------------------------------------------------------------
// Reset tokens
// ---------------------------------------------------------------------------

export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(authConfig.resetTokenBytes).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
