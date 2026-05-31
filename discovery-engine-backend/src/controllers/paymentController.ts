/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Controller
 * ============================================================================
 * Handles payment-related API endpoints:
 *   - GET  /api/payments/packages    → List available credit packages
 *   - POST /api/payments/create-order → Create a Razorpay order
 *   - POST /api/payments/verify      → Verify payment and add credits
 *   - POST /api/payments/fail        → Record failed payment attempt
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
  updatePaymentTransactionByOrderId,
  getPaymentTransactionByOrderId,
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
    console.log('[Payment] GET /packages');
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
      razorpayPaymentId: null, // Will be filled on verification
      status: 'created',
      amount: pkg.priceInPaise,
      creditsAdded: pkg.credits,
    });

    console.log(`[Payment] Order created: ${order.id} for package ${pkg.id}`);

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

    // Idempotency check: already processed?
    const existingTx = getPaymentTransactionByPaymentId(razorpay_payment_id);
    if (existingTx && existingTx.status === 'paid') {
      const currentBalance = await creditService.getBalance(userId);
      console.log(`[Payment] Duplicate verify for ${razorpay_payment_id}. Already paid.`);
      sendSuccess(
        res,
        { creditsAdded: existingTx.creditsAdded, newBalance: currentBalance },
        200,
        'This payment has already been processed.'
      );
      return;
    }

    // Check if payment was previously failed/cancelled
    if (existingTx && (existingTx.status === 'failed' || existingTx.status === 'cancelled')) {
      console.warn(`[Payment] Attempted to verify ${existingTx.status} payment ${razorpay_payment_id}`);
      throw new ApiError(`This payment has already been ${existingTx.status}. Please initiate a new purchase.`, 400);
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      throw new ApiError('Payment verification failed. Invalid signature.', 400);
    }

    // Find the order transaction (may have null payment ID at creation)
    const orderTx = getPaymentTransactionByOrderId(razorpay_order_id);

    // Find the package from the existing transaction or by order
    let creditsToAdd = 0;
    let amount = 0;

    if (existingTx) {
      creditsToAdd = existingTx.creditsAdded;
      amount = existingTx.amount;
    } else if (orderTx) {
      creditsToAdd = orderTx.creditsAdded;
      amount = orderTx.amount;
    } else {
      // Fallback: find by matching order amount to package price
      const pkg = creditPackages.find((p) => p.priceInPaise === amount);
      creditsToAdd = pkg?.credits || 0;
      amount = pkg?.priceInPaise || 0;
    }

    if (creditsToAdd === 0) {
      console.error(`[Payment] Could not determine credits for order ${razorpay_order_id}`);
      throw new ApiError('Could not determine credit package for this order.', 500);
    }

    // Add credits
    const newBalance = await creditService.addCredits(userId, creditsToAdd);

    // Update or create transaction record
    if (existingTx) {
      updatePaymentTransactionStatus(razorpay_payment_id, 'paid');
    } else if (orderTx) {
      updatePaymentTransactionByOrderId(razorpay_order_id, 'paid', razorpay_payment_id);
    } else {
      createPaymentTransaction({
        id: crypto.randomUUID(),
        userId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
        amount,
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
// POST /api/payments/fail
// ---------------------------------------------------------------------------
export const recordPaymentFailure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentId, reason } = req.body;

    if (!orderId || !paymentId) {
      throw new ApiError('orderId and paymentId are required.', 400);
    }

    const existingTx = getPaymentTransactionByPaymentId(paymentId) || getPaymentTransactionByOrderId(orderId);

    if (existingTx && existingTx.status === 'created') {
      if (existingTx.razorpayPaymentId) {
        updatePaymentTransactionStatus(existingTx.razorpayPaymentId, 'failed');
      } else {
        updatePaymentTransactionByOrderId(existingTx.razorpayOrderId, 'failed');
      }
      console.log(`[Payment] Recorded failure for order ${existingTx.razorpayOrderId}. Reason: ${reason || 'unknown'}`);
      sendSuccess(res, { status: 'failed' }, 200, 'Payment failure recorded.');
      return;
    }

    // If no existing transaction, create one with failed status
    if (!existingTx) {
      createPaymentTransaction({
        id: crypto.randomUUID(),
        userId: dummyUser.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: 'failed',
        amount: 0,
        creditsAdded: 0,
      });
      console.log(`[Payment] Created failed transaction record for ${paymentId}`);
    }

    sendSuccess(res, { status: 'failed' }, 200, 'Payment failure recorded.');
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
    // req.body is a Buffer because this route uses express.raw() middleware
    const rawBody = req.body as Buffer;
    const bodyString = rawBody.toString();

    if (!signature) {
      console.warn('[Payment] Webhook received without signature');
      res.status(400).json({ success: false, message: 'Missing webhook signature.' });
      return;
    }

    if (!config.razorpayKeySecret) {
      console.warn('[Payment] Webhook received but Razorpay secret not configured');
      res.status(400).json({ success: false, message: 'Razorpay not configured.' });
      return;
    }

    // Use webhook-specific secret if configured, otherwise fall back to key secret
    const webhookSecret = config.razorpayWebhookSecret || config.razorpayKeySecret;

    // Verify webhook signature using raw body string
    const isValid = verifyWebhookSignature(bodyString, signature, webhookSecret);
    if (!isValid) {
      console.warn('[Payment] Invalid webhook signature');
      res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      return;
    }

    // Parse body only after signature verification
    let payload: any;
    try {
      payload = JSON.parse(bodyString);
    } catch {
      console.warn('[Payment] Invalid JSON in webhook body');
      res.status(400).json({ success: false, message: 'Invalid JSON body.' });
      return;
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event !== 'payment.captured' || !paymentEntity) {
      console.log(`[Payment] Webhook event ignored: ${event || 'unknown'}`);
      res.status(200).json({ success: true, message: 'Event ignored.' });
      return;
    }

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const amount = paymentEntity.amount;

    // Idempotency check
    const existingTx = getPaymentTransactionByPaymentId(razorpayPaymentId);
    if (existingTx) {
      if (existingTx.status === 'paid') {
        console.log(`[Payment] Webhook duplicate for already-paid ${razorpayPaymentId}`);
        res.status(200).json({ success: true, message: 'Already processed.' });
        return;
      }
      if (existingTx.status === 'failed' || existingTx.status === 'cancelled') {
        console.warn(`[Payment] Webhook for ${existingTx.status} payment ${razorpayPaymentId}`);
        res.status(200).json({ success: true, message: 'Payment was failed/cancelled.' });
        return;
      }
    }

    // Find the order transaction (may have null payment ID at creation)
    const orderTx = getPaymentTransactionByOrderId(razorpayOrderId);

    // Find credits to add
    let creditsToAdd = 0;
    if (existingTx) {
      creditsToAdd = existingTx.creditsAdded;
    } else if (orderTx) {
      creditsToAdd = orderTx.creditsAdded;
    } else {
      const pkg = creditPackages.find((p) => p.priceInPaise === amount);
      creditsToAdd = pkg?.credits || 0;
    }

    const userId = dummyUser.id;

    // Add credits
    if (creditsToAdd > 0) {
      const newBalance = await creditService.addCredits(userId, creditsToAdd);
      console.log(`[Payment] Webhook added ${creditsToAdd} credits for ${razorpayPaymentId}. New balance: ${newBalance}`);
    } else {
      console.warn(`[Payment] Webhook could not determine credits for ${razorpayPaymentId}`);
    }

    // Record/update transaction
    if (existingTx) {
      updatePaymentTransactionStatus(razorpayPaymentId, 'paid');
    } else if (orderTx) {
      updatePaymentTransactionByOrderId(razorpayOrderId, 'paid', razorpayPaymentId);
    } else {
      createPaymentTransaction({
        id: crypto.randomUUID(),
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        status: 'paid',
        amount,
        creditsAdded: creditsToAdd,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
