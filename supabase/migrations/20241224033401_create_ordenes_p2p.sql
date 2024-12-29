-- Create enum for order types
CREATE TYPE tipo_orden AS ENUM ('compra', 'venta');

-- Create enum for order status
CREATE TYPE estado_orden AS ENUM ('abierta', 'en_proceso', 'completada', 'cancelada', 'disputada');

-- Create enum for currencies
CREATE TYPE tipo_moneda AS ENUM ('USD', 'ARS', 'BRL', 'WLD');

-- Create the orders table
CREATE TABLE IF NOT EXISTS ordenes_p2p (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    moneda tipo_moneda NOT NULL,
    tipo tipo_orden NOT NULL,
    cantidad DECIMAL(20,8) NOT NULL CHECK (cantidad > 0),
    precio DECIMAL(20,2) NOT NULL CHECK (precio > 0),
    metodo_pago VARCHAR(100),
    instrucciones TEXT,
    estado estado_orden NOT NULL DEFAULT 'abierta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ordenes_p2p_user ON ordenes_p2p(user_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_p2p_estado ON ordenes_p2p(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_p2p_moneda ON ordenes_p2p(moneda);
CREATE INDEX IF NOT EXISTS idx_ordenes_p2p_created ON ordenes_p2p(created_at DESC);

-- Add RLS policies
ALTER TABLE ordenes_p2p ENABLE ROW LEVEL SECURITY;

-- Policy for viewing orders (anyone can view open orders)
CREATE POLICY "Ver órdenes abiertas" ON ordenes_p2p
    FOR SELECT
    USING (estado = 'abierta' OR auth.uid() = user_id);

-- Policy for creating orders (authenticated users only)
CREATE POLICY "Crear órdenes" ON ordenes_p2p
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating orders (owner only)
CREATE POLICY "Actualizar órdenes propias" ON ordenes_p2p
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ordenes_p2p_updated_at
    BEFORE UPDATE ON ordenes_p2p
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check user trade limits
CREATE OR REPLACE FUNCTION check_user_trade_limits()
RETURNS TRIGGER AS $$
DECLARE
    daily_orders INTEGER;
    max_daily_orders INTEGER := 10; -- Ajustar según necesidad
BEGIN
    -- Contar órdenes del usuario en las últimas 24 horas
    SELECT COUNT(*)
    INTO daily_orders
    FROM ordenes_p2p
    WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';

    IF daily_orders >= max_daily_orders THEN
        RAISE EXCEPTION 'Has excedido el límite de órdenes diarias';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for trade limits
CREATE TRIGGER check_trade_limits
    BEFORE INSERT ON ordenes_p2p
    FOR EACH ROW
    EXECUTE FUNCTION check_user_trade_limits();

-- Comments
COMMENT ON TABLE ordenes_p2p IS 'Tabla para almacenar órdenes P2P de intercambio de monedas';
COMMENT ON COLUMN ordenes_p2p.moneda IS 'Tipo de moneda de la orden';
COMMENT ON COLUMN ordenes_p2p.tipo IS 'Tipo de orden: compra o venta';
COMMENT ON COLUMN ordenes_p2p.cantidad IS 'Cantidad de moneda a intercambiar';
COMMENT ON COLUMN ordenes_p2p.precio IS 'Precio por unidad en la moneda de destino';
COMMENT ON COLUMN ordenes_p2p.estado IS 'Estado actual de la orden';
COMMENT ON COLUMN ordenes_p2p.metodo_pago IS 'Método de pago aceptado';
COMMENT ON COLUMN ordenes_p2p.instrucciones IS 'Instrucciones adicionales para el intercambio';
