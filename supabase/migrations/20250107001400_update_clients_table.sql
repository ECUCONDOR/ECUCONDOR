-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_client_relation;
DROP TABLE IF EXISTS public.clients;

-- Create enum types
DO $$ BEGIN
    CREATE TYPE public.client_type AS ENUM ('personal', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.relation_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create clients table with improved structure
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    identification text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    phone text NOT NULL,
    type client_type NOT NULL DEFAULT 'personal',
    address text,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    updated_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~* '^\+?[0-9]{10,15}$')
);

-- Create user_client_relation table
CREATE TABLE public.user_client_relation (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    client_id uuid NOT NULL REFERENCES public.clients(id),
    status relation_status NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, client_id)
);

-- Create indexes for better performance
CREATE INDEX idx_clients_identification ON public.clients (identification);
CREATE INDEX idx_clients_email ON public.clients (email);
CREATE INDEX idx_clients_created_by ON public.clients (created_by);
CREATE INDEX idx_user_client_relation_user_id ON public.user_client_relation (user_id);
CREATE INDEX idx_user_client_relation_client_id ON public.user_client_relation (client_id);
CREATE INDEX idx_user_client_relation_status ON public.user_client_relation (status);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_client_relation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "Users can view their own clients"
    ON public.clients
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.user_client_relation 
            WHERE client_id = id 
            AND status = 'ACTIVE'
        )
    );

CREATE POLICY "Users can insert their own clients"
    ON public.clients
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
    );

CREATE POLICY "Users can update their own clients"
    ON public.clients
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.user_client_relation 
            WHERE client_id = id 
            AND status = 'ACTIVE'
        )
    )
    WITH CHECK (
        auth.uid() = updated_by
    );

-- Create RLS policies for user_client_relation table
CREATE POLICY "Users can view their own relations"
    ON public.user_client_relation
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert their own relations"
    ON public.user_client_relation
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own relations"
    ON public.user_client_relation
    FOR UPDATE
    USING (
        auth.uid() = user_id
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_user_client_relation_updated_at
    BEFORE UPDATE ON public.user_client_relation
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_client_by_identification(p_identification TEXT)
RETURNS TABLE (
    exists boolean,
    client_id uuid,
    error_message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as exists,
        c.id as client_id,
        NULL as error_message
    FROM public.clients c
    WHERE c.identification = p_identification
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::uuid, NULL::text;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_client_by_identification IS 'Checks if a client exists with the given identification';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.user_client_relation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_by_identification TO authenticated;
