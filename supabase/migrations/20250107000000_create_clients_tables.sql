-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_client_by_identification(TEXT);
DROP FUNCTION IF EXISTS public.get_client_details_by_identification(TEXT);

-- Drop existing tables
DROP TABLE IF EXISTS public.user_client_relations;
DROP TABLE IF EXISTS public.user_client_relation;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    identification TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    type TEXT CHECK (type IN ('personal', 'business')) DEFAULT 'personal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);

-- Create user-client relation table
CREATE TABLE IF NOT EXISTS public.user_client_relation (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, client_id)
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_client_relation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own client relations" ON public.user_client_relation
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their linked clients" ON public.clients
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT client_id 
            FROM public.user_client_relation 
            WHERE user_id = auth.uid()
            AND status = 'ACTIVE'
        )
    );

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_client_by_identification(p_identification TEXT)
RETURNS TABLE (
    found boolean,
    client_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE as found,
        id as client_id
    FROM public.clients
    WHERE identification = p_identification
    LIMIT 1;

    -- If no rows were returned, return a single row with found = false and null client_id
    IF NOT FOUND THEN
        RETURN QUERY SELECT false::boolean as found, NULL::uuid as client_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_details_by_identification(p_identification TEXT)
RETURNS SETOF public.clients
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT c.*
    FROM public.clients c
    WHERE c.identification = p_identification
    AND EXISTS (
        SELECT 1 
        FROM public.user_client_relation ucr 
        WHERE ucr.client_id = c.id 
        AND ucr.user_id = auth.uid()
        AND ucr.status = 'ACTIVE'
    );
END;
$$;
