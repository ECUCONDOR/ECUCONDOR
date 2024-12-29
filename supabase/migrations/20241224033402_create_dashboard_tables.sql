-- Billeteras digitales
CREATE TABLE IF NOT EXISTS billeteras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    moneda VARCHAR NOT NULL,
    direccion VARCHAR NOT NULL,
    etiqueta VARCHAR,
    activa BOOLEAN DEFAULT true,
    validada BOOLEAN DEFAULT false,
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, moneda, direccion)
);

-- Movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo VARCHAR NOT NULL,
    estado VARCHAR NOT NULL,
    moneda_origen VARCHAR NOT NULL,
    monto_origen DECIMAL(20,8) NOT NULL,
    moneda_destino VARCHAR,
    monto_destino DECIMAL(20,8),
    tasa_cambio DECIMAL(20,8),
    comision DECIMAL(20,8),
    hash_transaccion VARCHAR,
    direccion_destino VARCHAR,
    metodo_pago VARCHAR,
    comprobante_url VARCHAR,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_amounts CHECK (
        monto_origen > 0 AND
        (monto_destino IS NULL OR monto_destino > 0) AND
        (comision IS NULL OR comision >= 0)
    )
);

-- Operaciones de Exchange
CREATE TABLE IF NOT EXISTS operaciones_exchange (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    par_trading VARCHAR NOT NULL,
    tipo_orden VARCHAR NOT NULL,
    cantidad DECIMAL(20,8) NOT NULL,
    precio DECIMAL(20,8) NOT NULL,
    total DECIMAL(20,8) NOT NULL,
    estado VARCHAR NOT NULL,
    fecha_ejecucion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_values CHECK (
        cantidad > 0 AND
        precio > 0 AND
        total > 0
    )
);

-- Estado de Cuenta
CREATE TABLE IF NOT EXISTS estado_cuenta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo_operacion VARCHAR NOT NULL,
    descripcion TEXT NOT NULL,
    moneda VARCHAR NOT NULL,
    monto DECIMAL(20,8) NOT NULL,
    saldo_anterior DECIMAL(20,8) NOT NULL,
    saldo_nuevo DECIMAL(20,8) NOT NULL,
    referencia VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_balances CHECK (
        saldo_anterior >= 0 AND
        saldo_nuevo >= 0
    )
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_billeteras_user ON billeteras(user_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_user ON movimientos(user_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_estado ON movimientos(estado);
CREATE INDEX IF NOT EXISTS idx_operaciones_exchange_user ON operaciones_exchange(user_id);
CREATE INDEX IF NOT EXISTS idx_operaciones_exchange_estado ON operaciones_exchange(estado);
CREATE INDEX IF NOT EXISTS idx_estado_cuenta_user ON estado_cuenta(user_id);

-- RLS Policies

-- Billeteras
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver billeteras propias" ON billeteras
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Crear billeteras propias" ON billeteras
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actualizar billeteras propias" ON billeteras
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Movimientos
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver movimientos propios" ON movimientos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Crear movimientos propios" ON movimientos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actualizar movimientos propios" ON movimientos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Operaciones Exchange
ALTER TABLE operaciones_exchange ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver operaciones exchange propias" ON operaciones_exchange
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Crear operaciones exchange propias" ON operaciones_exchange
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actualizar operaciones exchange propias" ON operaciones_exchange
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Estado de Cuenta
ALTER TABLE estado_cuenta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver estado de cuenta propio" ON estado_cuenta
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Triggers para actualización de timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_movimientos_updated_at
    BEFORE UPDATE ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar estado de cuenta
CREATE OR REPLACE FUNCTION update_estado_cuenta()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo_anterior DECIMAL(20,8);
    v_saldo_nuevo DECIMAL(20,8);
    v_descripcion TEXT;
BEGIN
    -- Obtener saldo anterior
    SELECT COALESCE(MAX(saldo_nuevo), 0)
    INTO v_saldo_anterior
    FROM estado_cuenta
    WHERE user_id = NEW.user_id
    AND moneda = NEW.moneda_origen;

    -- Calcular nuevo saldo
    IF NEW.tipo = 'deposito' THEN
        v_saldo_nuevo := v_saldo_anterior + NEW.monto_origen;
        v_descripcion := 'Depósito de ' || NEW.monto_origen || ' ' || NEW.moneda_origen;
    ELSIF NEW.tipo = 'retiro' THEN
        v_saldo_nuevo := v_saldo_anterior - NEW.monto_origen;
        v_descripcion := 'Retiro de ' || NEW.monto_origen || ' ' || NEW.moneda_origen;
    ELSE
        v_saldo_nuevo := v_saldo_anterior;
        v_descripcion := 'Operación de ' || NEW.tipo;
    END IF;

    -- Insertar en estado de cuenta
    INSERT INTO estado_cuenta (
        user_id,
        tipo_operacion,
        descripcion,
        moneda,
        monto,
        saldo_anterior,
        saldo_nuevo,
        referencia
    ) VALUES (
        NEW.user_id,
        NEW.tipo,
        v_descripcion,
        NEW.moneda_origen,
        NEW.monto_origen,
        v_saldo_anterior,
        v_saldo_nuevo,
        NEW.id::text
    );

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_estado_cuenta
    AFTER INSERT ON movimientos
    FOR EACH ROW
    EXECUTE FUNCTION update_estado_cuenta();
