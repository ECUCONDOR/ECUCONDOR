-- Check the structure of user_client_relation table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_client_relation'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'user_client_relation';

-- Check a sample of records to confirm data types
SELECT 
    ucr.id,
    ucr.user_id,
    ucr.client_id,
    c.id as client_table_id
FROM user_client_relation ucr
JOIN clients c ON c.id = ucr.client_id
LIMIT 5;
