/**
 * ============================================================================
 * DISCOVERY ENGINE - Razorpay Service
 * ============================================================================
 * Wraps the Razorpay Node.js SDK for order creation and signature verification.
 * ============================================================================
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config';
import { ApiError } from '../middleware/errorHandler';
import { CreditPackage } from '../types';

// ---------------------------------------------------------------------------
// Initialize Razorpay client
// ---------------------------------------------------------------------------
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
      throw new ApiError('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503);
    }
    razorpayInstance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
  return razorpayInstance;
}

// ---------------------------------------------------------------------------
// Create Razorpay Order
// ---------------------------------------------------------------------------
export async function createRazorpayOrder(pkg: CreditPackage, userId: string) {
  const razorpay = getRazorpay();
  const receipt = `receipt_${userId}_${Date.now()}`;

  try {
    const order = await razorpay.orders.create({
      amount: pkg.priceInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId,
        packageId: pkg.id,
        credits: String(pkg.credits),
      },
    });

    console.log(`[Razorpay] Order created: ${order.id} for user ${userId}, amount ${pkg.priceInPaise}`);
    return order;
  } catch (error) {
    console.error('[Razorpay] Failed to create order:', error);
    throw new ApiError('Failed to create payment order. Please try again.', 500);
  }
}

// ---------------------------------------------------------------------------
// Verify Razorpay Payment Signature
// ---------------------------------------------------------------------------
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!config.razorpayKeySecret) {
    throw new ApiError('Razorpay secret key is not configured.', 503);
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === signature;
  console.log(`[Razorpay] Signature verification: ${isValid ? 'VALID' : 'INVALID'} for payment ${paymentId}`);
  return isValid;
}

// ---------------------------------------------------------------------------
// Verify Webhook Signature
// ---------------------------------------------------------------------------
export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}
