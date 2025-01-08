-- Let's look at both tables separately first
SELECT 'Clients Table' as source, id::text as id_value
FROM clients 
LIMIT 3;

SELECT 'User Client Relation Table' as source, client_id::text as client_id_value
FROM user_client_relation
LIMIT 3;

-- Check for any records in user_client_relation that don't have a matching client
SELECT ucr.client_id::text as missing_client_id
FROM user_client_relation ucr
LEFT JOIN clients c ON c.id = ucr.client_id::uuid
WHERE c.id IS NULL;
