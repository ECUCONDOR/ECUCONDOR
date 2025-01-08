-- Create client_stats table
CREATE TABLE IF NOT EXISTS public.client_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  client_id BIGINT REFERENCES public.clients(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  previous_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Create indices for client_stats
CREATE INDEX idx_client_stats_client_id ON public.client_stats(client_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for updating timestamps
CREATE TRIGGER handle_updated_at_client_stats
  BEFORE UPDATE ON public.client_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.client_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_stats
CREATE POLICY "Users can view stats of their clients"
ON public.client_stats
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id 
    FROM public.user_client_relation 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update stats of their clients"
ON public.client_stats
FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT client_id 
    FROM public.user_client_relation 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id 
    FROM public.user_client_relation 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
