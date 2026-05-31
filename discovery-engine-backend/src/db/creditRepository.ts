/**
 * ============================================================================
 * DISCOVERY ENGINE - Credit Repository
 * ============================================================================
 * Data access layer for credit transactions using SQLite.
 * ============================================================================
 */

import { db } from './index';

export interface CreditTransaction {
  id: number;
  userId: string;
  blueprintId?: string;
  action: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rowToTransaction(row: any): CreditTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    blueprintId: row.blueprint_id || undefined,
    action: row.action,
    amount: row.amount,
    balanceAfter: row.balance_after,
    description: row.description || undefined,
    createdAt: new Date(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// Credit Transaction CRUD
// ---------------------------------------------------------------------------
export function getTransactionsByUser(userId: string, limit = 50): CreditTransaction[] {
  const stmt = db.prepare('SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  const rows = stmt.all(userId, limit) as any[];
  return rows.map(rowToTransaction);
}

export function addTransaction(tx: Omit<CreditTransaction, 'id'>): CreditTransaction {
  const stmt = db.prepare(`
    INSERT INTO credit_transactions (user_id, blueprint_id, action, amount, balance_after, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    tx.userId,
    tx.blueprintId || null,
    tx.action,
    tx.amount,
    tx.balanceAfter,
    tx.description || null,
    tx.createdAt.toISOString()
  );
  return { ...tx, id: Number(result.lastInsertRowid) };
}

export function getBalance(userId: string): number | undefined {
  const stmt = db.prepare('SELECT credits FROM users WHERE id = ?');
  const row = stmt.get(userId) as any;
  return row ? row.credits : undefined;
}

export function updateBalance(userId: string, newBalance: number): void {
  const stmt = db.prepare('UPDATE users SET credits = ?, updated_at = ? WHERE id = ?');
  stmt.run(newBalance, new Date().toISOString(), userId);
}
