/**
 * ============================================================================
 * DISCOVERY ENGINE - Database Layer
 * ============================================================================
 * Supports PostgreSQL (production/serverless) and SQLite (local development).
 * Automatically selects based on DATABASE_URL env var.
 * ============================================================================
 */

import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const connectionString = process.env.DATABASE_URL;
const isPostgres = !!connectionString;

// PostgreSQL pool (only created if DATABASE_URL is set)
export const pool = isPostgres
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    })
  : (null as any);

// SQLite instance (only created if no DATABASE_URL)
let sqliteDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;

async function getSqliteDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!sqliteDb) {
    sqliteDb = await open({
      filename: './data/dev.sqlite',
      driver: sqlite3.Database,
    });
  }
  return sqliteDb;
}

// Normalize SQL from pg $N style to sqlite ? style
function normalizeSql(text: string): string {
  if (isPostgres) return text;
  let counter = 0;
  return text.replace(/\$(\d+)/g, () => `?${++counter}`).replace(/\?\d+/g, '?');
}

// Unified query function — always returns { rows: any[], rowCount?: number }
export async function query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount?: number }> {
  if (isPostgres) {
    return pool.query(text, params);
  }
  const db = await getSqliteDb();
  const sql = normalizeSql(text);
  const lower = sql.trim().toLowerCase();
  const isSelect = lower.startsWith('select');
  const isReturning = lower.includes('returning');

  if (isSelect || isReturning) {
    const rows = isReturning
      ? [await db.get(sql, params)]
      : await db.all(sql, params);
    return { rows: rows.filter(Boolean), rowCount: rows.length };
  }

  const result = await db.run(sql, params);
  return { rows: [], rowCount: result.changes };
}

// ---------------------------------------------------------------------------
// Initialize Schema
// ---------------------------------------------------------------------------
export async function initDb() {
  if (isPostgres) {
    await initPostgres();
  } else {
    await initSqlite();
  }
}

async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blueprints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress',
      current_step INTEGER NOT NULL DEFAULT 1,
      progress INTEGER NOT NULL DEFAULT 0,
      niche TEXT,
      audience TEXT,
      program TEXT,
      roadmap TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      blueprint_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'blueprint',
      created_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      language TEXT NOT NULL DEFAULT 'english',
      credits INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      blueprint_id TEXT,
      action TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      description TEXT,
      created_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
      amount INTEGER NOT NULL,
      credits_added INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)`);

  console.log('[DB] PostgreSQL schema initialized');
}

async function initSqlite() {
  const db = await getSqliteDb();

  await db.run(`
    CREATE TABLE IF NOT EXISTS blueprints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress',
      current_step INTEGER NOT NULL DEFAULT 1,
      progress INTEGER NOT NULL DEFAULT 0,
      niche TEXT,
      audience TEXT,
      program TEXT,
      roadmap TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      blueprint_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'blueprint',
      created_at TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      language TEXT NOT NULL DEFAULT 'english',
      credits INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      blueprint_id TEXT,
      action TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
      amount INTEGER NOT NULL,
      credits_added INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.run(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)`);

  console.log('[DB] SQLite schema initialized');
}
