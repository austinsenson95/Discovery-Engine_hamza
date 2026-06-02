-- ============================================================================
-- DISCOVERY ENGINE - Supabase PostgreSQL Schema
-- ============================================================================
-- Run this in Supabase SQL Editor if you want to initialize tables manually.
-- Otherwise, the backend auto-creates these on the first API request.
-- ============================================================================

-- Blueprints table
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
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  blueprint_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'blueprint',
  created_at TIMESTAMP NOT NULL
);

-- Users table
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
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  blueprint_id TEXT,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL
);

-- Payment transactions table (for Razorpay idempotency)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
  amount INTEGER NOT NULL,
  credits_added INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
