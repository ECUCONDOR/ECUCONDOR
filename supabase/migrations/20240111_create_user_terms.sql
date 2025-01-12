-- Create user_terms table
CREATE TABLE IF NOT EXISTS public.user_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own terms acceptance"
    ON public.user_terms
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can accept terms"
    ON public.user_terms
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to get dashboard data
CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_client_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN json_build_object(
        'user_info', (
            SELECT json_build_object(
                'id', id,
                'email', email,
                'created_at', created_at
            )
            FROM auth.users
            WHERE id = p_client_id
        ),
        'terms_accepted', (
            SELECT EXISTS (
                SELECT 1
                FROM public.user_terms
                WHERE user_id = p_client_id
            )
        )
    );
END;
$$;
