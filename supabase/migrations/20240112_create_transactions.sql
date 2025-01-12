-- Create transactions table
CREATE TYPE transaction_type AS ENUM ('USD_TO_ARS', 'ARS_TO_USD');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    converted_amount DECIMAL(15,2) NOT NULL,
    exchange_rate DECIMAL(10,2) NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    alias TEXT NOT NULL,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending transactions"
ON transactions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('UTC'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
