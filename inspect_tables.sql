-- Check the structure of both tables
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('clients', 'user_client_relation')
AND column_name IN ('id', 'client_id');

-- Look at actual data samples
SELECT 'clients' as table_name, id::text as id_value
FROM clients 
LIMIT 5;

SELECT 'user_client_relation' as table_name, client_id::text as client_id_value
FROM user_client_relation
LIMIT 5;

-- Count total records in each table
SELECT 'clients' as table_name, COUNT(*) as record_count
FROM clients
UNION ALL
SELECT 'user_client_relation', COUNT(*)
FROM user_client_relation;
