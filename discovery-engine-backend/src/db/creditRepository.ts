/**
 * ============================================================================
 * DISCOVERY ENGINE - Credit Repository
 * ============================================================================
 * Data access layer for credit transactions using PostgreSQL.
 * ============================================================================
 */

import { query } from './index';

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
export async function getTransactionsByUser(userId: string, limit = 50): Promise<CreditTransaction[]> {
  const { rows } = await query(
    'SELECT * FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return rows.map(rowToTransaction);
}

export async function addTransaction(tx: Omit<CreditTransaction, 'id'>): Promise<CreditTransaction> {
  const { rows } = await query(
    `INSERT INTO credit_transactions (user_id, blueprint_id, action, amount, balance_after, description, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      tx.userId,
      tx.blueprintId || null,
      tx.action,
      tx.amount,
      tx.balanceAfter,
      tx.description || null,
      tx.createdAt.toISOString(),
    ]
  );
  return { ...tx, id: Number(rows[0].id) };
}

export async function getBalance(userId: string): Promise<number | undefined> {
  const { rows } = await query('SELECT credits FROM users WHERE id = $1', [userId]);
  return rows[0] ? rows[0].credits : undefined;
}

export async function updateBalance(userId: string, newBalance: number): Promise<void> {
  await query('UPDATE users SET credits = $1, updated_at = $2 WHERE id = $3', [
    newBalance,
    new Date().toISOString(),
    userId,
  ]);
}
