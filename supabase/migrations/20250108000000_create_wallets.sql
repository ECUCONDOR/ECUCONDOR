-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets
CREATE POLICY "Users can view wallets of their clients"
ON public.wallets
FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT client_id 
        FROM public.user_client_relation 
        WHERE user_id = auth.uid()
        AND status = 'ACTIVE'
    )
);

-- Create trigger for updating timestamps
CREATE TRIGGER handle_updated_at_wallets
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
