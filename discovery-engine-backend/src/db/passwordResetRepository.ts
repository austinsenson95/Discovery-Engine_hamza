/**
 * ============================================================================
 * DISCOVERY ENGINE - Password Reset Repository
 * ============================================================================
 * Data access layer for password reset tokens using SQLite.
 * ============================================================================
 */

import { db } from './index';

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

export function createResetToken(userId: string, tokenHash: string, expiresAt: Date): PasswordResetToken {
  const stmt = db.prepare(`
    INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(userId, tokenHash, expiresAt.toISOString(), new Date().toISOString());

  return {
    id: Number(result.lastInsertRowid),
    userId,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  };
}

export function findValidToken(tokenHash: string): PasswordResetToken | undefined {
  const stmt = db.prepare(`
    SELECT * FROM password_resets
    WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
  `);
  const row = stmt.get(tokenHash, new Date().toISOString()) as any;
  return row ? rowToToken(row) : undefined;
}

export function markTokenUsed(tokenId: number): void {
  const stmt = db.prepare(`
    UPDATE password_resets SET used_at = ? WHERE id = ?
  `);
  stmt.run(new Date().toISOString(), tokenId);
}

export function cleanupExpiredTokens(): void {
  const stmt = db.prepare(`
    DELETE FROM password_resets WHERE expires_at < ?
  `);
  stmt.run(new Date().toISOString());
}
