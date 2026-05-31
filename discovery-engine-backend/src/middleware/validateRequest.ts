/**
 * ============================================================================
 * DISCOVERY ENGINE - Request Validation Middleware
 * ============================================================================
 * Validates incoming request bodies against expected schemas.
 *
 * TODO: Integrate with a validation library like:
 *   - Zod (recommended): npm install zod
 *   - Joi: npm install joi
 *   - express-validator: npm install express-validator
 *
 * Example with Zod:
 * ```typescript
 * import { z } from 'zod';
 *
 * const nicheSchema = z.object({
 *   skills: z.string().min(2).max(500),
 *   experience: z.string().min(2).max(1000),
 *   passions: z.string().min(2).max(500),
 * });
 *
 * export const validateNiche = validateBody(nicheSchema);
 * ```
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Generic body validator — checks required fields exist
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Niche form validation
 */
export const validateNicheForm = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { skills, experience, passions } = req.body;
  const errors: string[] = [];

  if (!skills || typeof skills !== 'string' || skills.trim().length < 2) {
    errors.push('skills must be at least 2 characters');
  }
  if (!experience || typeof experience !== 'string' || experience.trim().length < 2) {
    errors.push('experience must be at least 2 characters');
  }
  if (!passions || typeof passions !== 'string' || passions.trim().length < 2) {
    errors.push('passions must be at least 2 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};

/**
 * Auth form validation (register)
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name must be at least 2 characters');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password must be at least 6 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};

/**
 * Payment - Create Order validation
 */
export const validateCreateOrderBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { packageId } = req.body;
  const validPackages = ['starter', 'growth', 'pro'];

  if (!packageId || typeof packageId !== 'string') {
    res.status(400).json({
      success: false,
      message: 'packageId is required and must be a string.',
    });
    return;
  }

  if (!validPackages.includes(packageId)) {
    res.status(400).json({
      success: false,
      message: `Invalid packageId. Must be one of: ${validPackages.join(', ')}.`,
    });
    return;
  }

  next();
};

/**
 * Payment - Verify Payment validation
 */
export const validateVerifyPaymentBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const errors: string[] = [];

  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || razorpay_payment_id.trim() === '') {
    errors.push('razorpay_payment_id is required');
  }
  if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || razorpay_order_id.trim() === '') {
    errors.push('razorpay_order_id is required');
  }
  if (!razorpay_signature || typeof razorpay_signature !== 'string' || razorpay_signature.trim() === '') {
    errors.push('razorpay_signature is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};

/**
 * Auth form validation (login)
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('email must be a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('password is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};
