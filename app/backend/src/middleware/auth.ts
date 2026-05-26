/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Middleware
 * ============================================================================
 * Middleware to protect routes by verifying JWT tokens.
 *
 * TODO: Replace mock authentication with real JWT verification:
 * ```typescript
 * import jwt from 'jsonwebtoken';
 *
 * const token = req.headers.authorization?.split(' ')[1];
 * const decoded = jwt.verify(token, process.env.JWT_SECRET);
 * req.user = decoded;
 * ```
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';

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

/**
 * Mock auth middleware — passes all requests with a dummy user
 * TODO: Replace with real JWT verification
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    // For development: allow requests without a token
    // TODO: In production, return 401
    console.log('[Auth] No token provided — using mock user (dev mode)');
    req.user = { id: 'usr_001', email: 'john.doe@example.com' };
    next();
    return;
  }

  // TODO: Verify JWT token
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string };
  //   req.user = { id: decoded.userId, email: decoded.email };
  //   next();
  // } catch (error) {
  //   res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  // }

  // For now, accept any token
  req.user = { id: 'usr_001', email: 'john.doe@example.com' };
  next();
};

/**
 * Optional auth — doesn't require a token but adds user if present
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token) {
    req.user = { id: 'usr_001', email: 'john.doe@example.com' };
  }

  next();
};
