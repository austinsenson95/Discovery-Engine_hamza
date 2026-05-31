/**
 * ============================================================================
 * DISCOVERY ENGINE - User Routes
 * ============================================================================
 * Routes:
 *   GET  /api/user/me              → Get current user profile
 *   PUT  /api/user/profile         → Update user profile
 *   GET  /api/user/credits         → Get credit balance and costs
 *   GET  /api/user/activity        → Get recent activity feed
 *   GET  /api/user/achievements    → Get computed achievements
 *   GET  /api/user/credit-history  → Get credit transaction history
 * ============================================================================
 */

import { Router } from 'express';
import {
  getMe,
  updateProfile,
  getCredits,
  getActivity,
  getAchievements,
  getCreditHistory,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/credits', authenticate, getCredits);
router.get('/activity', authenticate, getActivity);
router.get('/achievements', authenticate, getAchievements);
router.get('/credit-history', authenticate, getCreditHistory);

export default router;
