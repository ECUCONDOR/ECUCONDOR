-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    nombre VARCHAR,
    apellidos VARCHAR,
    telefono VARCHAR,
    direccion TEXT,
    ciudad VARCHAR,
    pais VARCHAR,
    documento_identidad VARCHAR,
    fecha_nacimiento DATE,
    nacionalidad VARCHAR,
    rol_id UUID REFERENCES roles(id),
    estado_verificacion VARCHAR DEFAULT 'pendiente',
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    origen_fondos TEXT,
    limite_transaccional DECIMAL(19,4),
    pep BOOLEAN DEFAULT false,
    verificado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Activity history table
CREATE TABLE IF NOT EXISTS actividad_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo_actividad VARCHAR NOT NULL,
    descripcion TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- User configuration table
CREATE TABLE IF NOT EXISTS configuracion_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    clave VARCHAR NOT NULL,
    valor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, clave)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    titulo VARCHAR NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR NOT NULL,
    metadata JSONB,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Balances table
CREATE TABLE IF NOT EXISTS saldos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    moneda VARCHAR NOT NULL,
    monto DECIMAL(19,4) NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    CONSTRAINT unique_user_currency UNIQUE (user_id, moneda),
    CONSTRAINT check_positive_balance CHECK (monto >= 0)
);

-- Exchange rates table
CREATE TABLE IF NOT EXISTS tipos_cambio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    par_monedas VARCHAR NOT NULL UNIQUE,
    valor DECIMAL(19,4) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    CONSTRAINT check_positive_rate CHECK (valor > 0)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo VARCHAR NOT NULL,
    monto DECIMAL(19,4) NOT NULL,
    moneda_origen VARCHAR NOT NULL,
    moneda_destino VARCHAR,
    tasa_cambio DECIMAL(19,4),
    estado VARCHAR NOT NULL DEFAULT 'pendiente',
    hash_transaccion VARCHAR UNIQUE,
    confirmaciones INTEGER DEFAULT 0,
    metadata JSONB,
    referencia VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    CONSTRAINT valid_transaction_amount CHECK (monto > 0)
);

-- KYC documents table
CREATE TABLE IF NOT EXISTS documentos_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo_documento VARCHAR NOT NULL,
    nombre_archivo VARCHAR NOT NULL,
    url_archivo TEXT NOT NULL,
    estado VARCHAR NOT NULL DEFAULT 'pendiente',
    metadata JSONB,
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    verificado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verificacion ON profiles(estado_verificacion);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad_usuario(user_id, tipo_actividad);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(user_id, leido);
CREATE INDEX IF NOT EXISTS idx_saldos_usuario ON saldos(user_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(user_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(created_at);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario ON documentos_usuario(user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION generate_transaction_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hash_transaccion := encode(digest(NEW.id::text || NEW.user_id::text || NEW.monto::text || NEW.created_at::text, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_saldo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo IN ('deposito', 'compra') THEN
        INSERT INTO saldos (user_id, moneda, monto)
        VALUES (NEW.user_id, NEW.moneda_destino, NEW.monto)
        ON CONFLICT (user_id, moneda) 
        DO UPDATE SET 
            monto = saldos.monto + NEW.monto,
            actualizado_en = NOW();
    ELSIF NEW.tipo IN ('retiro', 'venta') THEN
        UPDATE saldos 
        SET monto = monto - NEW.monto,
            actualizado_en = NOW()
        WHERE user_id = NEW.user_id 
        AND moneda = NEW.moneda_origen
        AND monto >= NEW.monto;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Saldo insuficiente';
        END IF;
    END IF;
    
    INSERT INTO actividad_usuario (
        user_id,
        tipo_actividad,
        descripcion,
        metadata
    ) VALUES (
        NEW.user_id,
        'transaccion_' || NEW.tipo,
        'Transacción ' || NEW.tipo || ' por ' || NEW.monto || ' ' || COALESCE(NEW.moneda_destino, NEW.moneda_origen),
        jsonb_build_object(
            'tipo', NEW.tipo,
            'monto', NEW.monto,
            'moneda_origen', NEW.moneda_origen,
            'moneda_destino', NEW.moneda_destino,
            'estado', NEW.estado
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_generate_transaction_hash
    BEFORE INSERT ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION generate_transaction_hash();

CREATE TRIGGER trigger_actualizar_saldo
    AFTER INSERT ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_usuario ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Usuarios pueden ver su propia actividad"
    ON actividad_usuario FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver su propia configuración"
    ON configuracion_usuario FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
    ON notificaciones FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver sus propios saldos"
    ON saldos FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver sus propias transacciones"
    ON transacciones FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear transacciones"
    ON transacciones FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden ver sus propios documentos"
    ON documentos_usuario FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden subir documentos"
    ON documentos_usuario FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Insert initial roles
INSERT INTO roles (nombre, descripcion) VALUES
    ('administrador', 'Acceso completo al sistema'),
    ('usuario', 'Usuario regular del sistema'),
    ('operador', 'Puede realizar operaciones específicas')
ON CONFLICT (nombre) DO NOTHING;
