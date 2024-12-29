-- Create enum types
CREATE TYPE currency_type AS ENUM ('ARS', 'USD');
CREATE TYPE operation_type AS ENUM ('BUY', 'SELL');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE operation_status AS ENUM ('PENDING', 'FUNDS_RECEIVED', 'COMPLETED', 'FAILED');
CREATE TYPE operation_step_type AS ENUM ('START', 'FUNDS_RECEPTION', 'COMPANY_TRANSFER');
CREATE TYPE operation_step_status AS ENUM ('COMPLETED', 'ERROR');

-- Create custody accounts table
CREATE TABLE custody_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type currency_type NOT NULL,
    bank TEXT NOT NULL,
    account_number TEXT NOT NULL,
    cbu TEXT NOT NULL UNIQUE,
    alias TEXT NOT NULL UNIQUE,
    owner TEXT NOT NULL,
    owner_document TEXT NOT NULL,
    balance DECIMAL(20,2) NOT NULL DEFAULT 0,
    status account_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    recent_operations JSONB[] DEFAULT ARRAY[]::JSONB[],
    daily_limit DECIMAL(20,2) NOT NULL,
    monthly_limit DECIMAL(20,2) NOT NULL,
    CONSTRAINT valid_balance CHECK (balance >= 0)
);

-- Create custody operations table
CREATE TABLE custody_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type operation_type NOT NULL,
    source_currency currency_type NOT NULL,
    target_currency currency_type NOT NULL,
    source_amount DECIMAL(20,2) NOT NULL,
    target_amount DECIMAL(20,2) NOT NULL,
    exchange_rate JSONB NOT NULL,
    source_account_id UUID NOT NULL REFERENCES custody_accounts(id),
    target_account_id UUID NOT NULL REFERENCES custody_accounts(id),
    status operation_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    steps JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[],
    CONSTRAINT positive_amounts CHECK (source_amount > 0 AND target_amount > 0)
);

-- Create functions for balance operations
CREATE OR REPLACE FUNCTION increment_balance(account_id UUID, amount DECIMAL)
RETURNS DECIMAL LANGUAGE plpgsql AS $$
BEGIN
    RETURN (SELECT balance + amount FROM custody_accounts WHERE id = account_id);
END;
$$;

CREATE OR REPLACE FUNCTION decrement_balance(account_id UUID, amount DECIMAL)
RETURNS DECIMAL LANGUAGE plpgsql AS $$
BEGIN
    RETURN (SELECT balance - amount FROM custody_accounts WHERE id = account_id);
END;
$$;

-- Create RLS policies
ALTER TABLE custody_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_operations ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view accounts
CREATE POLICY "View custody accounts" ON custody_accounts
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users can insert accounts
CREATE POLICY "Insert custody accounts" ON custody_accounts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only authenticated users can update accounts
CREATE POLICY "Update custody accounts" ON custody_accounts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Only authenticated users can view operations
CREATE POLICY "View custody operations" ON custody_operations
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users can insert operations
CREATE POLICY "Insert custody operations" ON custody_operations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only authenticated users can update operations
CREATE POLICY "Update custody operations" ON custody_operations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_custody_accounts_type ON custody_accounts(type);
CREATE INDEX idx_custody_accounts_status ON custody_accounts(status);
CREATE INDEX idx_custody_operations_status ON custody_operations(status);
CREATE INDEX idx_custody_operations_created_at ON custody_operations(created_at);
CREATE INDEX idx_custody_operations_source_account ON custody_operations(source_account_id);
CREATE INDEX idx_custody_operations_target_account ON custody_operations(target_account_id);
