-- Start the transaction
BEGIN;

-- Log what we're about to delete
CREATE TEMP TABLE deleted_relations AS
SELECT 
    ucr.id,
    ucr.user_id,
    ucr.client_id,
    ucr.created_at,
    u.email as user_email
FROM user_client_relation ucr
LEFT JOIN auth.users u ON u.id = ucr.user_id
WHERE ucr.client_id::text IN ('8e9a1e07-806b-4ec0-b638-29c44d116e82', 'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9');

-- Show what we're about to delete
SELECT * FROM deleted_relations;

-- Delete the invalid relations
DELETE FROM user_client_relation
WHERE client_id::text IN ('8e9a1e07-806b-4ec0-b638-29c44d116e82', 'a3fe4a09-5c2c-4fb4-b04b-de35e66187d9');

-- Add new column (idempotent)
ALTER TABLE user_client_relation
ADD COLUMN IF NOT EXISTS client_id_new BIGINT;

-- Drop existing constraint if it exists (idempotent)
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

-- Attempt the conversion (idempotent)
UPDATE user_client_relation ucr
SET client_id_new = c.id
FROM clients c
WHERE ucr.client_id::text = c.id::text;

-- Final updates (idempotent)
ALTER TABLE user_client_relation DROP COLUMN IF EXISTS client_id;
ALTER TABLE user_client_relation RENAME COLUMN client_id_new TO client_id;
ALTER TABLE user_client_relation ALTER COLUMN client_id SET NOT NULL;

-- Add back the foreign key constraint
ALTER TABLE user_client_relation
ADD CONSTRAINT user_client_relation_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id);

-- Add comment
COMMENT ON TABLE user_client_relation IS 'Stores relationships between users and clients. client_id is BIGINT to match clients table.';

-- Show summary of what was deleted (for record keeping)
SELECT * FROM deleted_relations;

-- Clean up
DROP TABLE deleted_relations;

-- Commit the changes
COMMIT;
