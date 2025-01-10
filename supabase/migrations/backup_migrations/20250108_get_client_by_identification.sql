-- Create function to get client by identification
CREATE OR REPLACE FUNCTION public.get_client_details_by_identification(p_identification TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    identification TEXT,
    email TEXT,
    phone TEXT,
    type client_type,
    address TEXT,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.identification,
        c.email,
        c.phone,
        c.type,
        c.address,
        c.created_by,
        c.updated_by,
        c.created_at,
        c.updated_at
    FROM clients c
    WHERE c.identification = p_identification;
END;
$$ LANGUAGE plpgsql;

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_clients_identification 
ON public.clients(identification);

-- Add RLS policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client info" 
    ON public.clients FOR SELECT
    USING (EXISTS (
        SELECT 1
        FROM user_client_relation ucr
        WHERE ucr.user_id = auth.uid()
        AND ucr.client_id = clients.id
    ));

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_client_details_by_identification(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_details_by_identification(TEXT) TO service_role;