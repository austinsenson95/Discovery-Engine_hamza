/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Routes
 * ============================================================================
 * Routes:
 *   GET  /api/payments/packages     → List available credit packages
 *   POST /api/payments/create-order → Create a Razorpay order
 *   POST /api/payments/verify       → Verify payment and add credits
 *   POST /api/payments/webhook      → Handle Razorpay webhooks
 * ============================================================================
 */

import { Router } from 'express';
import { getPackages, createOrder, verifyPayment, webhookHandler } from '../controllers/paymentController';

const router = Router();

router.get('/packages', getPackages);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', webhookHandler);

export default router;
