/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Routes
 * ============================================================================
 * Routes:
 *   POST /api/auth/register       → Register new user
 *   POST /api/auth/login          → Login user
 *   POST /api/auth/forgot-password → Request password reset
 *   POST /api/auth/reset-password  → Reset password with token
 * ============================================================================
 */

import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../middleware/validateRequest';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
