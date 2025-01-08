-- First, add a new bigint column (nullable initially)
ALTER TABLE user_client_relation 
ADD COLUMN client_id_new BIGINT;

-- Drop the existing foreign key constraint if it exists
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

-- Update the new column with converted values
UPDATE user_client_relation ucr
SET client_id_new = c.id
FROM clients c
WHERE ucr.client_id::text = c.id::text;

-- Check if we have any NULL values in the new column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM user_client_relation
        WHERE client_id_new IS NULL
    ) THEN
        RAISE EXCEPTION 'Some client_id values could not be converted. Please check the data integrity.';
    END IF;
END $$;

-- If we reach here, it means all values were converted successfully
-- Now we can safely drop the old column and rename the new one
ALTER TABLE user_client_relation
DROP COLUMN client_id;

-- Rename the new column
ALTER TABLE user_client_relation
RENAME COLUMN client_id_new TO client_id;

-- Add NOT NULL constraint now that we know all values are set
ALTER TABLE user_client_relation
ALTER COLUMN client_id SET NOT NULL;

-- Add back the foreign key constraint
ALTER TABLE user_client_relation
ADD CONSTRAINT user_client_relation_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id);

-- Add comment to explain the change
COMMENT ON TABLE user_client_relation IS 'Stores relationships between users and clients. client_id is BIGINT to match clients table.';
