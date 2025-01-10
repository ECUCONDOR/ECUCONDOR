-- Check if the constraint exists before dropping
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

-- Modify the client_id column to be BIGINT
ALTER TABLE user_client_relation
ALTER COLUMN client_id TYPE BIGINT USING client_id::bigint;

-- Add back the foreign key constraint
ALTER TABLE user_client_relation
ADD CONSTRAINT user_client_relation_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id);

-- Add comment to explain the change
COMMENT ON TABLE user_client_relation IS 'Stores relationships between users and clients. client_id is BIGINT to match clients table.';
