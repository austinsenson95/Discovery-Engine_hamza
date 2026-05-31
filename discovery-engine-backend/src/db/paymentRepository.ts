/**
 * ============================================================================
 * DISCOVERY ENGINE - Payment Repository
 * ============================================================================
 * Data access layer for payment transactions using SQLite.
 * ============================================================================
 */

import { db } from './index';
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
export function createPaymentTransaction(tx: Omit<PaymentTransaction, 'createdAt'>): PaymentTransaction {
  const stmt = db.prepare(`
    INSERT INTO payment_transactions (id, user_id, razorpay_order_id, razorpay_payment_id, status, amount, credits_added, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  stmt.run(
    tx.id,
    tx.userId,
    tx.razorpayOrderId,
    tx.razorpayPaymentId,
    tx.status,
    tx.amount,
    tx.creditsAdded,
    now
  );
  return { ...tx, createdAt: new Date(now) };
}

export function getPaymentTransactionByPaymentId(razorpayPaymentId: string): PaymentTransaction | undefined {
  const stmt = db.prepare('SELECT * FROM payment_transactions WHERE razorpay_payment_id = ?');
  const row = stmt.get(razorpayPaymentId) as PaymentTransactionRow | undefined;
  return row ? rowToTransaction(row) : undefined;
}

export function getPaymentTransactionByOrderId(razorpayOrderId: string): PaymentTransaction | undefined {
  const stmt = db.prepare('SELECT * FROM payment_transactions WHERE razorpay_order_id = ?');
  const row = stmt.get(razorpayOrderId) as PaymentTransactionRow | undefined;
  return row ? rowToTransaction(row) : undefined;
}

export function updatePaymentTransactionStatus(
  razorpayPaymentId: string,
  status: 'created' | 'paid' | 'failed' | 'cancelled'
): void {
  const stmt = db.prepare('UPDATE payment_transactions SET status = ? WHERE razorpay_payment_id = ?');
  stmt.run(status, razorpayPaymentId);
}

export function updatePaymentTransactionByOrderId(
  razorpayOrderId: string,
  status: 'created' | 'paid' | 'failed' | 'cancelled',
  razorpayPaymentId?: string | null
): void {
  if (razorpayPaymentId) {
    const stmt = db.prepare(
      'UPDATE payment_transactions SET status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ?'
    );
    stmt.run(status, razorpayPaymentId, razorpayOrderId);
  } else {
    const stmt = db.prepare('UPDATE payment_transactions SET status = ? WHERE razorpay_order_id = ?');
    stmt.run(status, razorpayOrderId);
  }
}

export function getPaymentTransactionsByUser(userId: string, limit = 50): PaymentTransaction[] {
  const stmt = db.prepare('SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  const rows = stmt.all(userId, limit) as PaymentTransactionRow[];
  return rows.map(rowToTransaction);
}
