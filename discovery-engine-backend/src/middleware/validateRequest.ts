/**
 * ============================================================================
 * DISCOVERY ENGINE - Request Validation Middleware
 * ============================================================================
 * Validates incoming request bodies using Zod schemas.
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from './errorHandler';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Email must be a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export const loginSchema = z.object({
  email: z.union([
    z.string().email('Email must be a valid email address'),
    z.literal('dev'),
  ]),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email must be a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64, 'Invalid reset token'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

// ---------------------------------------------------------------------------
// Generic body validator factory
// ---------------------------------------------------------------------------

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((issue: z.ZodIssue) => issue.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Legacy validators (kept for backward compatibility)
// ---------------------------------------------------------------------------

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

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);

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
