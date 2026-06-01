/**
 * ============================================================================
 * DISCOVERY ENGINE - User Repository
 * ============================================================================
 * Data access layer for users using PostgreSQL.
 * ============================================================================
 */

import { query } from './index';
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
    passwordHash: row.password_hash || undefined,
    avatar: row.avatar,
    language: row.language,
    credits: row.credits,
    isDev: row.email === 'dev',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------
export async function getUserById(userId: string): Promise<User | undefined> {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function createUser(user: User & { passwordHash: string }): Promise<User> {
  await query(
    `INSERT INTO users (id, name, email, password_hash, avatar, language, credits, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      user.id,
      user.name,
      user.email.toLowerCase(),
      user.passwordHash,
      user.avatar || null,
      user.language,
      user.credits,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    ]
  );
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User | undefined> {
  const existing = await getUserById(userId);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date() };

  await query(
    `UPDATE users SET
      name = $1,
      email = $2,
      password_hash = $3,
      avatar = $4,
      language = $5,
      credits = $6,
      updated_at = $7
    WHERE id = $8`,
    [
      merged.name,
      merged.email,
      merged.passwordHash || existing.passwordHash,
      merged.avatar || null,
      merged.language,
      merged.credits,
      merged.updatedAt.toISOString(),
      userId,
    ]
  );
  return merged;
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  await query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3', [
    passwordHash,
    new Date().toISOString(),
    userId,
  ]);
}

export async function getAllUsers(): Promise<User[]> {
  const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(rowToUser);
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------
export async function seedDummyUserIfNeeded(): Promise<User> {
  let user = await getUserById(dummyUser.id);
  if (!user) {
    const seedUser: User & { passwordHash: string } = {
      ...dummyUser,
      passwordHash: '$2a$12$abcdefghijklmnopqrstuvwxycdefghimnopqrstuvwx12345678901',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await createUser(seedUser);
    user = seedUser;
    console.log(`[UserRepository] Seeded dummy user: ${user.id}`);
  }
  return user;
}
