-- Check if these UUIDs exist in the clients table
SELECT 'Checking clients table...' as check_type;
SELECT id::text, created_at
FROM clients 
WHERE id::text IN ('8e9a1e07-806b-4ec0-b638-29c44d116e82', 'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9');

-- Check the user_client_relation records
SELECT 'Checking user_client_relation table...' as check_type;
SELECT ucr.client_id::text, ucr.user_id::text, ucr.created_at
FROM user_client_relation ucr
WHERE ucr.client_id::text IN ('8e9a1e07-806b-4ec0-b638-29c44d116e82', 'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9');

-- Check if these are orphaned records (relations without clients)
SELECT 'Checking for orphaned records...' as check_type;
SELECT ucr.client_id::text as missing_client_id, ucr.user_id::text, ucr.created_at
FROM user_client_relation ucr
LEFT JOIN clients c ON c.id::text = ucr.client_id::text
WHERE ucr.client_id::text IN ('8e9a1e07-806b-4ec0-b638-29c44d116e82', 'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9')
AND c.id IS NULL;
