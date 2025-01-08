-- Start a transaction so we can rollback if needed
BEGIN;

-- Check the relationships we're about to delete
SELECT 
    ucr.id,
    ucr.user_id,
    ucr.client_id,
    ucr.created_at,
    u.email as user_email
FROM user_client_relation ucr
LEFT JOIN auth.users u ON u.id = ucr.user_id
WHERE ucr.client_id::text IN (
    '8e9a1e07-806b-4ec0-b638-29c44d116e82', 
    'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9'
);

-- Check if these client_ids exist anywhere else
SELECT id, created_at
FROM clients 
WHERE id::text IN (
    '8e9a1e07-806b-4ec0-b638-29c44d116e82', 
    'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9'
);

ROLLBACK; -- Roll back the transaction since this is just a check
