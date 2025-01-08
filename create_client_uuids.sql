-- Create client_uuids table for mapping client IDs to UUIDs
CREATE TABLE IF NOT EXISTS client_uuids (
    client_id BIGINT PRIMARY KEY REFERENCES clients(id),
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_uuids_uuid ON client_uuids(uuid);

-- Add comment to table
COMMENT ON TABLE client_uuids IS 'Maps client numeric IDs to UUIDs for compatibility with user_client_relation table';
