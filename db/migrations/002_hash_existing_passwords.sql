-- Migration: Hash existing plain text passwords
-- Date: 2025-10-17
-- Description: This migration updates existing users' passwords to use bcrypt hashing
-- NOTE: This is a one-time migration. Run the corresponding Node.js script instead.

-- This file is kept for documentation purposes only.
-- Use the hash_passwords.js script to actually hash the passwords.

-- After running hash_passwords.js, the passwords will be:
-- u001:    user123   -> bcrypt hash
-- u002:    user456   -> bcrypt hash
-- admin:   admin123  -> bcrypt hash
