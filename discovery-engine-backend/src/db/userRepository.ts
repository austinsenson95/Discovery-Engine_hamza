/**
 * ============================================================================
 * DISCOVERY ENGINE - User Repository
 * ============================================================================
 * Data access layer for users using SQLite.
 * ============================================================================
 */

import { db } from './index';
import type { User } from '../types';
import { dummyUser } from '../data/dummyData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    language: row.language,
    credits: row.credits,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------
export function getUserById(userId: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(userId) as any;
  return row ? rowToUser(row) : undefined;
}

export function createUser(user: User): User {
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, avatar, language, credits, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    user.id,
    user.name,
    user.email,
    user.avatar || null,
    user.language,
    user.credits,
    user.createdAt.toISOString(),
    user.updatedAt.toISOString()
  );
  return user;
}

export function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
  const existing = getUserById(userId);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date() };

  const stmt = db.prepare(`
    UPDATE users SET
      name = ?,
      email = ?,
      avatar = ?,
      language = ?,
      credits = ?,
      updated_at = ?
    WHERE id = ?
  `);
  stmt.run(
    merged.name,
    merged.email,
    merged.avatar || null,
    merged.language,
    merged.credits,
    merged.updatedAt.toISOString(),
    userId
  );
  return merged;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  const rows = stmt.all() as any[];
  return rows.map(rowToUser);
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------
export function seedDummyUserIfNeeded(): User {
  let user = getUserById(dummyUser.id);
  if (!user) {
    user = { ...dummyUser, createdAt: new Date(), updatedAt: new Date() };
    createUser(user);
    console.log(`[UserRepository] Seeded dummy user: ${user.id}`);
  }
  return user;
}
