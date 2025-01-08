-- Check data types of both tables
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_client_relation' AND column_name = 'client_id';

-- Check for any mismatched or problematic records
SELECT ucr.id, ucr.client_id as ucr_client_id, c.id as client_id
FROM user_client_relation ucr
LEFT JOIN clients c ON ucr.client_id::text = c.id::text
WHERE c.id IS NULL;

-- Show sample of successful matches for comparison
SELECT ucr.id, ucr.client_id as ucr_client_id, c.id as client_id
FROM user_client_relation ucr
JOIN clients c ON ucr.client_id::text = c.id::text
LIMIT 5;
