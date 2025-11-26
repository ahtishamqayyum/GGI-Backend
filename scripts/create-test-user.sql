-- Script to create a test user for testing the API
-- Run this in your PostgreSQL database

INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    NOW(),
    NOW()
)
RETURNING id, email;

-- To get the user ID for testing:
-- SELECT id, email FROM users WHERE email = 'test@example.com';

