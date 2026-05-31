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

const router = Router();

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/credits', getCredits);
router.get('/activity', getActivity);
router.get('/achievements', getAchievements);
router.get('/credit-history', getCreditHistory);

export default router;
