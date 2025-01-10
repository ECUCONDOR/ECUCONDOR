-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS user_client_relation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_client_relation' 
        AND indexname = 'idx_user_client_relation_user_id'
    ) THEN
        CREATE INDEX idx_user_client_relation_user_id ON user_client_relation(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_client_relation' 
        AND indexname = 'idx_user_client_relation_client_id'
    ) THEN
        CREATE INDEX idx_user_client_relation_client_id ON user_client_relation(client_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_client_relation' 
        AND indexname = 'idx_user_client_relation_status'
    ) THEN
        CREATE INDEX idx_user_client_relation_status ON user_client_relation(status);
    END IF;
END $$;

-- Add a trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_client_relation_updated_at ON user_client_relation;

CREATE TRIGGER update_user_client_relation_updated_at
    BEFORE UPDATE ON user_client_relation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test relation if none exists
INSERT INTO user_client_relation (user_id, client_id, status)
SELECT 
    'b80476d9-b28a-477e-a6d1-f0ccbc131ae5'::uuid,
    id,
    'ACTIVE'
FROM clients 
WHERE NOT EXISTS (
    SELECT 1 FROM user_client_relation 
    WHERE user_id = 'b80476d9-b28a-477e-a6d1-f0ccbc131ae5'
    AND status = 'ACTIVE'
)
LIMIT 1;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own relations" ON public.user_client_relation;
DROP POLICY IF EXISTS "Users can create relations for their clients" ON public.user_client_relation;
DROP POLICY IF EXISTS "Users can update their own relations" ON public.user_client_relation;

-- Create policies
CREATE POLICY "Users can view their own relations"
ON public.user_client_relation FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can create relations for their clients"
ON public.user_client_relation FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "Users can update their own relations"
ON public.user_client_relation FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.user_client_relation TO authenticated;
