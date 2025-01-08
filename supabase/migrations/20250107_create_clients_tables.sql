-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    identification TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'business')),
    address TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_client_relations table
CREATE TABLE IF NOT EXISTS public.user_client_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Create verification_status table
CREATE TABLE IF NOT EXISTS public.verification_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Create RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients they are related to"
ON public.clients FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_client_relations
        WHERE user_client_relations.client_id = clients.id
        AND user_client_relations.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "Users can update clients they own"
ON public.clients FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_client_relations
        WHERE user_client_relations.client_id = clients.id
        AND user_client_relations.user_id = auth.uid()
        AND user_client_relations.role = 'owner'
    )
);

-- Create RLS policies for user_client_relations table
ALTER TABLE public.user_client_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own relations"
ON public.user_client_relations FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can create relations for their clients"
ON public.user_client_relations FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_client_relations
        WHERE user_client_relations.client_id = NEW.client_id
        AND user_client_relations.user_id = auth.uid()
        AND user_client_relations.role = 'owner'
    )
);

-- Create RLS policies for verification_status table
ALTER TABLE public.verification_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification status"
ON public.verification_status FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can create their own verification status"
ON public.verification_status FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "Users can update their own verification status"
ON public.verification_status FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
);
