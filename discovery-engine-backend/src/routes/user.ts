/**
 * ============================================================================
 * DISCOVERY ENGINE - User Routes
 * ============================================================================
 * Routes:
 *   GET  /api/user/me      → Get current user profile
 *   PUT  /api/user/profile → Update user profile
 *   GET  /api/user/credits → Get credit balance and costs
 * ============================================================================
 */

import { Router } from 'express';
import { getMe, updateProfile, getCredits } from '../controllers/userController';

const router = Router();

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/credits', getCredits);

export default router;
