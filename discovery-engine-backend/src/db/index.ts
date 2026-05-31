/**
 * ============================================================================
 * DISCOVERY ENGINE - SQLite Database
 * ============================================================================
 * Local SQLite database for persisting user blueprints across sessions.
 * Uses better-sqlite3 for synchronous, high-performance queries.
 * ============================================================================
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'discovery-engine.db');
const dbInstance: Database.Database = new Database(dbPath);

// Enable WAL mode for better concurrency
dbInstance.pragma('journal_mode = WAL');
dbInstance.pragma('foreign_keys = ON');

export { dbInstance as db };

// ---------------------------------------------------------------------------
// Initialize Schema
// ---------------------------------------------------------------------------
export function initDb() {
  // Blueprints table
  dbInstance.exec(`
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

  // Activities table
  dbInstance.exec(`
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

  // Users table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      language TEXT NOT NULL DEFAULT 'english',
      credits INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Credit transactions table
  dbInstance.exec(`
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

  // Indexes for performance
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`);

  console.log('[DB] SQLite database initialized at', dbPath);
}

initDb();
