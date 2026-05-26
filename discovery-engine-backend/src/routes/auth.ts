/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Routes
 * ============================================================================
 * Routes:
 *   POST /api/auth/register  → Register new user
 *   POST /api/auth/login     → Login user
 * ============================================================================
 */

import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validateRequest';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router;
