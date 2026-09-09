-- Database Migration: Add Google Sign-In Support & Email Field
-- Run this script against your PostgreSQL instance to upgrade existing tables.

-- 1. Ensure email column exists with UNIQUE constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- 2. Ensure avatar_url column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Make phone_number nullable (since users can sign up via Google without a phone number initially)
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

-- 4. Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
