-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_wallet_id UUID NOT NULL,
    to_wallet_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_code VARCHAR(50),
    FOREIGN KEY (from_wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(id),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create a view for transfer history
CREATE OR REPLACE VIEW transfer_history AS
SELECT 
    t.id,
    t.from_wallet_id,
    t.to_wallet_id,
    t.amount,
    t.description,
    t.status,
    t.created_at,
    t.reference_code,
    from_wallet.from_client_id,
    to_wallet.to_client_id
FROM transfers t
JOIN (
    SELECT 
        client_id as from_client_id,
        id as wallet_id
    FROM wallets
) as from_wallet ON t.from_wallet_id = from_wallet.wallet_id
JOIN (
    SELECT 
        client_id as to_client_id,
        id as wallet_id
    FROM wallets
) as to_wallet ON t.to_wallet_id = to_wallet.wallet_id;

-- Create RLS policies
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own transfers (sent or received)
CREATE POLICY view_own_transfers ON transfers FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 
        FROM wallets w 
        JOIN user_client_relation ucr ON w.client_id = ucr.client_id 
        WHERE (w.id = transfers.from_wallet_id OR w.id = transfers.to_wallet_id)
        AND ucr.user_id = auth.uid()
        AND ucr.status = 'ACTIVE'
    )
);

-- Policy to allow users to create transfers from their own wallets
CREATE POLICY create_own_transfers ON transfers FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM wallets w 
        JOIN user_client_relation ucr ON w.client_id = ucr.client_id 
        WHERE w.id = transfers.from_wallet_id 
        AND ucr.user_id = auth.uid()
        AND ucr.status = 'ACTIVE'
    )
);

-- Function to create a transfer with validation
CREATE OR REPLACE FUNCTION create_transfer(
    p_from_wallet_id UUID,
    p_to_wallet_id UUID,
    p_amount DECIMAL,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_from_balance DECIMAL;
    v_transfer_id UUID;
    v_result JSONB;
BEGIN
    -- Check if wallets exist
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_from_wallet_id) THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Wallet origen no encontrada'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_to_wallet_id) THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Wallet destino no encontrada'
        );
    END IF;

    -- Get current balance of source wallet
    SELECT balance INTO v_from_balance
    FROM wallets
    WHERE id = p_from_wallet_id;

    -- Check if there's enough balance
    IF v_from_balance < p_amount THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Saldo insuficiente'
        );
    END IF;

    -- Create transfer record
    INSERT INTO transfers (from_wallet_id, to_wallet_id, amount, description)
    VALUES (p_from_wallet_id, p_to_wallet_id, p_amount, p_description)
    RETURNING id INTO v_transfer_id;

    -- Update balances
    UPDATE wallets
    SET balance = balance - p_amount
    WHERE id = p_from_wallet_id;

    UPDATE wallets
    SET balance = balance + p_amount
    WHERE id = p_to_wallet_id;

    -- Return success response
    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Transferencia creada exitosamente',
        'transfer_id', v_transfer_id
    );

EXCEPTION WHEN OTHERS THEN
    -- Return error response
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$;
