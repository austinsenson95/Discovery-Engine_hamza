/**
 * ============================================================================
 * DISCOVERY ENGINE - Password Reset Repository
 * ============================================================================
 * Data access layer for password reset tokens using PostgreSQL.
 * ============================================================================
 */

import { query } from './index';

export interface PasswordResetToken {
  id: number;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

function rowToToken(row: any): PasswordResetToken {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: new Date(row.expires_at),
    usedAt: row.used_at ? new Date(row.used_at) : null,
    createdAt: new Date(row.created_at),
  };
}

export async function createResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<PasswordResetToken> {
  const { rows } = await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, tokenHash, expiresAt.toISOString(), new Date().toISOString()]
  );

  return {
    id: Number(rows[0].id),
    userId,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  };
}

export async function findValidToken(tokenHash: string): Promise<PasswordResetToken | undefined> {
  const { rows } = await query(
    `SELECT * FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > $2`,
    [tokenHash, new Date().toISOString()]
  );
  return rows[0] ? rowToToken(rows[0]) : undefined;
}

export async function markTokenUsed(tokenId: number): Promise<void> {
  await query('UPDATE password_resets SET used_at = $1 WHERE id = $2', [
    new Date().toISOString(),
    tokenId,
  ]);
}

export async function cleanupExpiredTokens(): Promise<void> {
  await query('DELETE FROM password_resets WHERE expires_at < $1', [new Date().toISOString()]);
}
