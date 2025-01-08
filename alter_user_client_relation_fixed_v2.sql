-- First, let's see what we're dealing with
SELECT 'Checking data types...' as step;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('clients', 'user_client_relation')
AND column_name IN ('id', 'client_id');

SELECT 'Checking sample data...' as step;
SELECT c.id as client_id, ucr.client_id as relation_client_id
FROM clients c
LEFT JOIN user_client_relation ucr ON ucr.client_id::text = c.id::text
LIMIT 5;

-- Now proceed with the careful conversion
SELECT 'Starting conversion process...' as step;

-- Add new column
ALTER TABLE user_client_relation 
ADD COLUMN client_id_new BIGINT;

-- Drop existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_client_relation_client_id_fkey'
        AND table_name = 'user_client_relation'
    ) THEN
        ALTER TABLE user_client_relation
        DROP CONSTRAINT user_client_relation_client_id_fkey;
    END IF;
END $$;

-- Show the current state
SELECT 'Current state before conversion...' as step;
SELECT COUNT(*) as total_relations FROM user_client_relation;
SELECT COUNT(*) as total_clients FROM clients;

-- Try the conversion with more detailed error reporting
DO $$
DECLARE
    failed_ids text;
BEGIN
    -- Attempt the conversion
    UPDATE user_client_relation ucr
    SET client_id_new = c.id
    FROM clients c
    WHERE ucr.client_id::text = c.id::text;
    
    -- Check for failures and collect problematic IDs
    SELECT STRING_AGG(client_id::text, ', ')
    INTO failed_ids
    FROM user_client_relation
    WHERE client_id_new IS NULL;
    
    IF failed_ids IS NOT NULL THEN
        RAISE EXCEPTION 'Conversion failed for the following client_ids: %', failed_ids;
    END IF;
END $$;

-- If we get here, conversion was successful
SELECT 'Conversion successful, proceeding with column updates...' as step;

ALTER TABLE user_client_relation DROP COLUMN client_id;
ALTER TABLE user_client_relation RENAME COLUMN client_id_new TO client_id;
ALTER TABLE user_client_relation ALTER COLUMN client_id SET NOT NULL;

-- Add back the foreign key constraint
ALTER TABLE user_client_relation
ADD CONSTRAINT user_client_relation_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id);

-- Add comment
COMMENT ON TABLE user_client_relation IS 'Stores relationships between users and clients. client_id is BIGINT to match clients table.';
