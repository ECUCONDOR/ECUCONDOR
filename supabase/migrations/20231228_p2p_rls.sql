-- Enable RLS on ordenes_p2p table
ALTER TABLE ordenes_p2p ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Ver órdenes activas" ON ordenes_p2p;
DROP POLICY IF EXISTS "Ver órdenes propias" ON ordenes_p2p;
DROP POLICY IF EXISTS "Crear órdenes" ON ordenes_p2p;
DROP POLICY IF EXISTS "Actualizar órdenes propias" ON ordenes_p2p;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS user_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    verified boolean DEFAULT false,
    max_order_amount numeric(20,8) DEFAULT 1000.0,
    daily_limit numeric(20,8) DEFAULT 5000.0,
    monthly_limit numeric(20,8) DEFAULT 50000.0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_limits
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Policy para ver órdenes activas (todos los usuarios autenticados)
CREATE POLICY "Ver órdenes activas" ON ordenes_p2p
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND estado = 'abierta');

-- Policy para ver órdenes propias (usuario creador)
CREATE POLICY "Ver órdenes propias" ON ordenes_p2p
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy para crear órdenes (usuarios verificados)
CREATE POLICY "Crear órdenes" ON ordenes_p2p
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM user_limits
            WHERE user_id = auth.uid()
            AND verified = true
        )
    );

-- Policy para actualizar órdenes propias
CREATE POLICY "Actualizar órdenes propias" ON ordenes_p2p
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy para ver límites propios
CREATE POLICY "Ver límites propios" ON user_limits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy para actualizar límites (solo admin)
CREATE POLICY "Actualizar límites" ON user_limits
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_limits_updated_at
    BEFORE UPDATE ON user_limits
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
