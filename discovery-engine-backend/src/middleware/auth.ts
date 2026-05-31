/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Middleware
 * ============================================================================
 * Middleware to protect routes by verifying JWT tokens.
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.userId, email: decoded.email };
    } catch {
      // Invalid token on optional auth is fine — just don't attach user
    }
  }

  next();
};
