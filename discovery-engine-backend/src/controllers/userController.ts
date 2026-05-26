/**
 * ============================================================================
 * DISCOVERY ENGINE - User Controller
 * ============================================================================
 * Handles user profile and credit management:
 *   - GET  /api/user/me      → Get current user profile
 *   - PUT  /api/user/profile → Update user profile
 *   - GET  /api/user/credits → Get credit balance and deduction info
 *
 * TODO: All endpoints currently use a mock user. Replace with:
 *   - JWT token extraction from Authorization header
 *   - Database queries for user data
 *   - Input validation middleware
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { dummyUser } from '../data/dummyData';
import { creditService } from '../services/creditService';
import { User } from '../types';

// In-memory store (mirrors authController store)
const userStore = new Map<string, User>();
userStore.set(dummyUser.id, { ...dummyUser });

/**
 * GET /api/user/me
 * Response: { user: User }
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`[User] GET /api/user/me — fetching current user`);

    // TODO: Extract userId from JWT token
    // const userId = req.user?.id; // After auth middleware
    const userId = dummyUser.id;

    // TODO: Fetch from database
    const user = userStore.get(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/user/profile
 * Request: { name?: string, language?: 'english' | 'hindi', avatar?: string }
 * Response: { user: User }
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, language, avatar } = req.body;
    console.log(`[User] PUT /api/user/profile — name="${name}", language="${language}"`);

    // TODO: Extract userId from JWT token
    const userId = dummyUser.id;

    // Fetch user
    const user = userStore.get(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Validate language if provided
    if (language && !['english', 'hindi'].includes(language)) {
      res.status(400).json({
        success: false,
        message: 'Language must be either "english" or "hindi".',
      });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (language) user.language = language as 'english' | 'hindi';
    if (avatar) user.avatar = avatar;
    user.updatedAt = new Date();

    userStore.set(userId, user);
    console.log(`[User] Profile updated for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/credits
 * Response: { balance: number, deductions: CreditDeductions, canAfford: {...} }
 */
export const getCredits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`[User] GET /api/user/credits — fetching credit info`);

    // TODO: Extract userId from JWT token
    const userId = dummyUser.id;

    const creditSummary = await creditService.getCreditSummary(userId);

    res.status(200).json({
      success: true,
      data: creditSummary,
    });
  } catch (error) {
    next(error);
  }
};
