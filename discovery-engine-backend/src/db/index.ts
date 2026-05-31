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
// Migration helpers
// ---------------------------------------------------------------------------
function migratePaymentTransactions() {
  const tableInfo = dbInstance.prepare("PRAGMA table_info(payment_transactions)").all() as any[];
  const paymentIdCol = tableInfo.find((col) => col.name === 'razorpay_payment_id');

  if (paymentIdCol && paymentIdCol.notnull === 1) {
    console.log('[DB] Migrating payment_transactions table (dropping UNIQUE/NOT NULL on razorpay_payment_id)...');
    dbInstance.exec(`
      ALTER TABLE payment_transactions RENAME TO payment_transactions_old;

      CREATE TABLE payment_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        razorpay_order_id TEXT NOT NULL,
        razorpay_payment_id TEXT,
        status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
        amount INTEGER NOT NULL,
        credits_added INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO payment_transactions
        (id, user_id, razorpay_order_id, razorpay_payment_id, status, amount, credits_added, created_at)
      SELECT
        id, user_id, razorpay_order_id,
        CASE WHEN razorpay_payment_id = '' THEN NULL ELSE razorpay_payment_id END,
        status, amount, credits_added, created_at
      FROM payment_transactions_old;

      DROP TABLE payment_transactions_old;
    `);
    console.log('[DB] Migration complete.');
  }
}

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
      credits INTEGER NOT NULL DEFAULT 999,
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

  // Payment transactions table (for Razorpay idempotency)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
      amount INTEGER NOT NULL,
      credits_added INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes for performance
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id)`);
  dbInstance.exec(`CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id)`);

  migratePaymentTransactions();

  console.log('[DB] SQLite database initialized at', dbPath);
}

initDb();
