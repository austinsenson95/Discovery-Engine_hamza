/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Routes
 * ============================================================================
 * Routes:
 *   GET  /api/payments/packages     → List available credit packages
 *   POST /api/payments/create-order → Create a Razorpay order
 *   POST /api/payments/verify       → Verify payment and add credits
 *   POST /api/payments/fail         → Record failed payment attempt
 *   POST /api/payments/webhook      → Handle Razorpay webhooks
 * ============================================================================
 */

import { Router } from 'express';
import { getPackages, createOrder, verifyPayment, recordPaymentFailure } from '../controllers/paymentController';
import { validateCreateOrderBody, validateVerifyPaymentBody } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/packages', getPackages);
router.post('/create-order', authenticate, validateCreateOrderBody, createOrder);
router.post('/verify', authenticate, validateVerifyPaymentBody, verifyPayment);
router.post('/fail', authenticate, recordPaymentFailure);

export default router;
