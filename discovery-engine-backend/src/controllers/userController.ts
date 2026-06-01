/**
 * ============================================================================
 * DISCOVERY ENGINE - User Controller
 * ============================================================================
 * Handles user profile and credit management:
 *   - GET  /api/user/me      → Get current user profile
 *   - PUT  /api/user/profile → Update user profile
 *   - GET  /api/user/credits → Get credit balance and deduction info
 *   - GET  /api/user/activity → Get recent activity feed
 *   - GET  /api/user/achievements → Get computed achievements
 *   - GET  /api/user/credit-history → Get credit transaction history
 *
 * Uses PostgreSQL via userRepository and creditRepository.
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { creditService } from '../services/creditService';
import {
  getUserById,
  updateUser,
  seedDummyUserIfNeeded,
} from '../db/userRepository';
import { getActivitiesByUser } from '../db/blueprintRepository';
import { getTransactionsByUser } from '../db/creditRepository';
import { getBlueprintsByUser } from '../db/blueprintRepository';

// Seeding is handled lazily by creditService

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripPasswordHash(user: any) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ---------------------------------------------------------------------------
// GET /api/user/me
// ---------------------------------------------------------------------------
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    console.log(`[User] GET /api/user/me — fetching current user`);
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: stripPasswordHash(user) },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/user/profile
// ---------------------------------------------------------------------------
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const { name, language, avatar } = req.body;
    console.log(`[User] PUT /api/user/profile — name="${name}", language="${language}"`);

    if (language && !['english', 'hindi'].includes(language)) {
      res.status(400).json({
        success: false,
        message: 'Language must be either "english" or "hindi".',
      });
      return;
    }

    const user = await updateUser(userId, {
      name,
      language: language as 'english' | 'hindi',
      avatar,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    console.log(`[User] Profile updated for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: { user: stripPasswordHash(user) },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/user/credits
// ---------------------------------------------------------------------------
export const getCredits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    console.log(`[User] GET /api/user/credits — fetching credit info`);
    const creditSummary = await creditService.getCreditSummary(userId);

    res.status(200).json({
      success: true,
      data: creditSummary,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/user/activity
// ---------------------------------------------------------------------------
export const getActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    console.log(`[User] GET /api/user/activity — fetching activity feed`);
    const activities = await getActivitiesByUser(userId, 50);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/user/achievements
// ---------------------------------------------------------------------------
export const getAchievements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    console.log(`[User] GET /api/user/achievements — computing achievements`);
    const blueprints = await getBlueprintsByUser(userId);
    const blueprint = blueprints[0];

    const achievements = [
      {
        id: '1',
        icon: 'rocket' as const,
        title: 'First Steps',
        description: 'Complete Step 1',
        earned: (blueprint?.currentStep || 0) >= 2,
        earnedAt: blueprint?.currentStep >= 2 ? blueprint.updatedAt : null,
        color: '#059669',
        bgColor: '#ECFDF5',
      },
      {
        id: '2',
        icon: 'users' as const,
        title: 'People Person',
        description: 'Complete Step 2',
        earned: (blueprint?.currentStep || 0) >= 3,
        earnedAt: blueprint?.currentStep >= 3 ? blueprint.updatedAt : null,
        color: '#059669',
        bgColor: '#ECFDF5',
      },
      {
        id: '3',
        icon: 'zap' as const,
        title: 'Getting Started',
        description: 'Start the wizard',
        earned: blueprints.length > 0,
        earnedAt: blueprints.length > 0 ? blueprints[0].createdAt : null,
        color: '#F05A28',
        bgColor: '#FFF0EB',
      },
      {
        id: '4',
        icon: 'filetext' as const,
        title: 'Program Builder',
        description: 'Complete Step 3',
        earned: (blueprint?.currentStep || 0) >= 5,
        earnedAt: blueprint?.currentStep >= 5 ? blueprint.updatedAt : null,
        color: '#D4D4D4',
        bgColor: '#F5F5F5',
      },
      {
        id: '5',
        icon: 'trophy' as const,
        title: 'Roadmapper',
        description: 'Complete Step 4',
        earned: (blueprint?.currentStep || 0) >= 8,
        earnedAt: blueprint?.currentStep >= 8 ? blueprint.updatedAt : null,
        color: '#D4D4D4',
        bgColor: '#F5F5F5',
      },
      {
        id: '6',
        icon: 'download' as const,
        title: 'PDF Pro',
        description: 'Download your first blueprint',
        earned: false,
        earnedAt: null,
        color: '#D4D4D4',
        bgColor: '#F5F5F5',
      },
      {
        id: '7',
        icon: 'star' as const,
        title: 'Credit Saver',
        description: 'Complete with credits remaining',
        earned: blueprints.some(bp => bp.status === 'completed'),
        earnedAt: blueprints.find(bp => bp.status === 'completed')?.updatedAt || null,
        color: '#D4D4D4',
        bgColor: '#F5F5F5',
      },
      {
        id: '8',
        icon: 'lightbulb' as const,
        title: 'Speed Runner',
        description: 'Complete all steps in one day',
        earned: false,
        earnedAt: null,
        color: '#D4D4D4',
        bgColor: '#F5F5F5',
      },
    ];

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/user/credit-history
// ---------------------------------------------------------------------------
export const getCreditHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    console.log(`[User] GET /api/user/credit-history — fetching transactions`);
    const transactions = await getTransactionsByUser(userId, 50);
    const balance = await creditService.getBalance(userId);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        balance,
      },
    });
  } catch (error) {
    next(error);
  }
};
