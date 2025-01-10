-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'user_client_relation'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_client_relation';

-- Check if there are any active relations for the current user
SELECT ucr.*, c.first_name, c.last_name
FROM user_client_relation ucr
JOIN clients c ON c.id = ucr.client_id
WHERE ucr.user_id = 'b80476d9-b28a-477e-a6d1-f0ccbc131ae5'
AND ucr.status = 'ACTIVE';
