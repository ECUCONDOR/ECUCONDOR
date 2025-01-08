-- Drop existing triggers and policies
DROP TRIGGER IF EXISTS set_updated_at ON public.clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;

-- Modify clients table
ALTER TABLE public.clients
    ALTER COLUMN created_by SET NOT NULL,
    ALTER COLUMN updated_by SET NOT NULL;

-- Create user_client_relation table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_client_relation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Enable RLS on user_client_relation
ALTER TABLE public.user_client_relation ENABLE ROW LEVEL SECURITY;

-- Update clients policies to use user_client_relation
CREATE POLICY "Users can view their related clients"
    ON public.clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_client_relation ucr 
            WHERE ucr.client_id = id 
            AND ucr.user_id = auth.uid()
            AND ucr.status = 'ACTIVE'
        )
    );

CREATE POLICY "Users can insert their own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their related clients"
    ON public.clients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_client_relation ucr 
            WHERE ucr.client_id = id 
            AND ucr.user_id = auth.uid()
            AND ucr.status = 'ACTIVE'
        )
    )
    WITH CHECK (auth.uid() = updated_by);

-- Add policies for user_client_relation
CREATE POLICY "Users can view their own relations"
    ON public.user_client_relation FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own relations"
    ON public.user_client_relation FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own relations"
    ON public.user_client_relation FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create function to automatically create user_client_relation
CREATE OR REPLACE FUNCTION public.handle_client_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_client_relation (user_id, client_id)
    VALUES (NEW.created_by, NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic user_client_relation creation
CREATE TRIGGER create_user_client_relation
    AFTER INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_client_creation();

-- Add helpful functions
CREATE OR REPLACE FUNCTION public.get_user_clients(p_user_id UUID)
RETURNS TABLE (
    client_id UUID,
    name VARCHAR,
    identification VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    type VARCHAR,
    address VARCHAR,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        c.created_at,
        c.updated_at
    FROM public.clients c
    INNER JOIN public.user_client_relation ucr ON ucr.client_id = c.id
    WHERE ucr.user_id = p_user_id
    AND ucr.status = 'ACTIVE';
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.user_client_relation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_clients TO authenticated;
