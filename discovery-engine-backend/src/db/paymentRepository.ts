/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Repository
 * ============================================================================
 * Data access layer for payment transactions using PostgreSQL.
 * ============================================================================
 */

import { query } from './index';
import { PaymentTransaction } from '../types';

export interface PaymentTransactionRow {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  credits_added: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rowToTransaction(row: PaymentTransactionRow): PaymentTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    status: row.status,
    amount: row.amount,
    creditsAdded: row.credits_added,
    createdAt: new Date(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// Payment Transaction CRUD
// ---------------------------------------------------------------------------
export async function createPaymentTransaction(
  tx: Omit<PaymentTransaction, 'createdAt'>
): Promise<PaymentTransaction> {
  const now = new Date().toISOString();
  await query(
    `INSERT INTO payment_transactions (id, user_id, razorpay_order_id, razorpay_payment_id, status, amount, credits_added, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      tx.id,
      tx.userId,
      tx.razorpayOrderId,
      tx.razorpayPaymentId,
      tx.status,
      tx.amount,
      tx.creditsAdded,
      now,
    ]
  );
  return { ...tx, createdAt: new Date(now) };
}

export async function getPaymentTransactionByPaymentId(
  razorpayPaymentId: string
): Promise<PaymentTransaction | undefined> {
  const { rows } = await query('SELECT * FROM payment_transactions WHERE razorpay_payment_id = $1', [
    razorpayPaymentId,
  ]);
  return rows[0] ? rowToTransaction(rows[0]) : undefined;
}

export async function getPaymentTransactionByOrderId(
  razorpayOrderId: string
): Promise<PaymentTransaction | undefined> {
  const { rows } = await query('SELECT * FROM payment_transactions WHERE razorpay_order_id = $1', [
    razorpayOrderId,
  ]);
  return rows[0] ? rowToTransaction(rows[0]) : undefined;
}

export async function updatePaymentTransactionStatus(
  razorpayPaymentId: string,
  status: 'created' | 'paid' | 'failed' | 'cancelled'
): Promise<void> {
  await query('UPDATE payment_transactions SET status = $1 WHERE razorpay_payment_id = $2', [
    status,
    razorpayPaymentId,
  ]);
}

export async function updatePaymentTransactionByOrderId(
  razorpayOrderId: string,
  status: 'created' | 'paid' | 'failed' | 'cancelled',
  razorpayPaymentId?: string | null
): Promise<void> {
  if (razorpayPaymentId) {
    await query(
      'UPDATE payment_transactions SET status = $1, razorpay_payment_id = $2 WHERE razorpay_order_id = $3',
      [status, razorpayPaymentId, razorpayOrderId]
    );
  } else {
    await query('UPDATE payment_transactions SET status = $1 WHERE razorpay_order_id = $2', [
      status,
      razorpayOrderId,
    ]);
  }
}

export async function getPaymentTransactionsByUser(
  userId: string,
  limit = 50
): Promise<PaymentTransaction[]> {
  const { rows } = await query(
    'SELECT * FROM payment_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return rows.map(rowToTransaction);
}
