-- CareerTrack Database Schema
-- Run this file to initialize the PostgreSQL database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  grades            JSONB NOT NULL,
  riasec_scores     JSONB NOT NULL,
  aptitude_ratings  JSONB NOT NULL,
  recommendations   JSONB NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Index for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- To set the first admin manually, run:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
