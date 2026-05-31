/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Controller
 * ============================================================================
 * Handles payment-related API endpoints:
 *   - GET  /api/payments/packages    → List available credit packages
 *   - POST /api/payments/create-order → Create a Razorpay order
 *   - POST /api/payments/verify      → Verify payment and add credits
 *   - POST /api/payments/webhook     → Handle Razorpay webhooks
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { creditPackages, dummyUser } from '../data/dummyData';
import { createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature } from '../services/razorpayService';
import { creditService } from '../services/creditService';
import { ApiError } from '../middleware/errorHandler';
import { config } from '../config';
import {
  createPaymentTransaction,
  getPaymentTransactionByPaymentId,
  updatePaymentTransactionStatus,
} from '../db/paymentRepository';
import crypto from 'crypto';

/**
 * Utility: Send standardized success response
 */
const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200, message?: string) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

// ---------------------------------------------------------------------------
// GET /api/payments/packages
// ---------------------------------------------------------------------------
export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, { packages: creditPackages });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/create-order
// ---------------------------------------------------------------------------
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { packageId } = req.body;
    const userId = dummyUser.id;

    if (!packageId) {
      throw new ApiError('Package ID is required.', 400);
    }

    const pkg = creditPackages.find((p) => p.id === packageId);
    if (!pkg) {
      throw new ApiError('Invalid credit package ID.', 400);
    }

    const order = await createRazorpayOrder(pkg, userId);

    // Record the transaction as 'created'
    createPaymentTransaction({
      id: crypto.randomUUID(),
      userId,
      razorpayOrderId: order.id,
      razorpayPaymentId: '', // Will be filled on verification
      status: 'created',
      amount: pkg.priceInPaise,
      creditsAdded: pkg.credits,
    });

    sendSuccess(res, {
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      package: {
        id: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
      },
      key: config.razorpayKeyId,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/verify
// ---------------------------------------------------------------------------
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const userId = dummyUser.id;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new ApiError('Missing payment verification data.', 400);
    }

    // Idempotency check: already processed?
    const existingTx = getPaymentTransactionByPaymentId(razorpay_payment_id);
    if (existingTx && existingTx.status === 'paid') {
      const currentBalance = await creditService.getBalance(userId);
      sendSuccess(
        res,
        { creditsAdded: existingTx.creditsAdded, newBalance: currentBalance },
        200,
        'This payment has already been processed.'
      );
      return;
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      throw new ApiError('Payment verification failed. Please contact support.', 400);
    }

    // Find the package from the order
    const pkg = creditPackages.find((p) => p.priceInPaise === (existingTx?.amount || 0));
    const creditsToAdd = pkg?.credits || existingTx?.creditsAdded || 0;

    // Add credits
    const newBalance = await creditService.addCredits(userId, creditsToAdd);

    // Update or create transaction record
    if (existingTx) {
      updatePaymentTransactionStatus(razorpay_payment_id, 'paid');
    } else {
      createPaymentTransaction({
        id: crypto.randomUUID(),
        userId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
        amount: pkg?.priceInPaise || 0,
        creditsAdded: creditsToAdd,
      });
    }

    console.log(`[Payment] Verified payment ${razorpay_payment_id}. Added ${creditsToAdd} credits. New balance: ${newBalance}`);

    sendSuccess(
      res,
      { creditsAdded: creditsToAdd, newBalance },
      200,
      `Payment successful! ${creditsToAdd} credits added to your account.`
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/webhook
// ---------------------------------------------------------------------------
export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !config.razorpayKeySecret) {
      res.status(400).json({ success: false, message: 'Invalid webhook request.' });
      return;
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, config.razorpayKeySecret);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      return;
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event !== 'payment.captured' || !paymentEntity) {
      res.status(200).json({ success: true });
      return;
    }

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const amount = paymentEntity.amount;

    // Idempotency check
    const existingTx = getPaymentTransactionByPaymentId(razorpayPaymentId);
    if (existingTx && existingTx.status === 'paid') {
      res.status(200).json({ success: true, message: 'Already processed.' });
      return;
    }

    // Find package by amount
    const pkg = creditPackages.find((p) => p.priceInPaise === amount);
    const creditsToAdd = pkg?.credits || 0;
    const userId = dummyUser.id;

    // Add credits
    await creditService.addCredits(userId, creditsToAdd);

    // Record transaction
    createPaymentTransaction({
      id: crypto.randomUUID(),
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      status: 'paid',
      amount,
      creditsAdded: creditsToAdd,
    });

    console.log(`[Webhook] Processed payment ${razorpayPaymentId}. Added ${creditsToAdd} credits.`);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
