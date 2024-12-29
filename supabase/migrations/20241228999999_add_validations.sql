-- Validaciones para la tabla profiles
DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_phone_format
    CHECK (telefono ~ '^\+[0-9]{10,15}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_document_format 
    CHECK (documento_identidad ~ '^[A-Z0-9]{5,20}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_birth_date 
    CHECK (fecha_nacimiento <= CURRENT_DATE - INTERVAL '18 years');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_verification_status 
    CHECK (estado_verificacion IN ('pendiente', 'en_proceso', 'verificado', 'rechazado'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_transactional_limit 
    CHECK (limite_transaccional >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Función de validación de transacciones
CREATE OR REPLACE FUNCTION validate_transaction()
RETURNS TRIGGER AS $$
DECLARE
    user_limit DECIMAL;
    daily_total DECIMAL;
BEGIN
    -- Verificar límite transaccional del usuario
    SELECT limite_transaccional INTO user_limit
    FROM profiles WHERE id = NEW.user_id;
    
    -- Calcular total diario
    SELECT COALESCE(SUM(monto), 0) INTO daily_total
    FROM transacciones
    WHERE user_id = NEW.user_id
    AND created_at > CURRENT_DATE;
    
    -- Validar límite diario
    IF (daily_total + NEW.monto) > user_limit THEN
        RAISE EXCEPTION 'Excede el límite transaccional diario';
    END IF;
    
    -- Validar estado de verificación del usuario
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.user_id 
        AND verificado = true
    ) THEN
        RAISE EXCEPTION 'Usuario no verificado';
    END IF;
    
    -- Validar tipo de transacción
    IF NEW.tipo NOT IN ('deposito', 'retiro', 'compra', 'venta') THEN
        RAISE EXCEPTION 'Tipo de transacción inválido';
    END IF;
    
    -- Validar tasa de cambio si aplica
    IF NEW.tasa_cambio IS NOT NULL AND NEW.tasa_cambio <= 0 THEN
        RAISE EXCEPTION 'Tasa de cambio inválida';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de transacciones
DROP TRIGGER IF EXISTS validate_transaction_trigger ON transacciones;
CREATE TRIGGER validate_transaction_trigger
    BEFORE INSERT OR UPDATE ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION validate_transaction();

-- Función de validación de órdenes P2P
CREATE OR REPLACE FUNCTION validate_p2p_order()
RETURNS TRIGGER AS $$
DECLARE
    open_orders INTEGER;
    daily_volume DECIMAL;
BEGIN
    -- Verificar órdenes abiertas
    SELECT COUNT(*) INTO open_orders
    FROM ordenes_p2p
    WHERE user_id = NEW.user_id
    AND estado = 'abierta';
    
    IF open_orders >= 5 THEN
        RAISE EXCEPTION 'Máximo de órdenes abiertas alcanzado';
    END IF;
    
    -- Verificar volumen diario
    SELECT COALESCE(SUM(cantidad * precio), 0) INTO daily_volume
    FROM ordenes_p2p
    WHERE user_id = NEW.user_id
    AND created_at > CURRENT_DATE;
    
    IF daily_volume > 10000 THEN
        RAISE EXCEPTION 'Volumen diario excedido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de órdenes P2P
DROP TRIGGER IF EXISTS validate_p2p_order_trigger ON ordenes_p2p;
CREATE TRIGGER validate_p2p_order_trigger
    BEFORE INSERT OR UPDATE ON ordenes_p2p
    FOR EACH ROW
    EXECUTE FUNCTION validate_p2p_order();

-- Función de validación de documentos KYC
CREATE OR REPLACE FUNCTION validate_kyc_document()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar tipo de documento
    IF NEW.tipo_documento NOT IN ('dni', 'pasaporte', 'licencia', 'comprobante_domicilio') THEN
        RAISE EXCEPTION 'Tipo de documento no válido';
    END IF;
    
    -- Validar formato de archivo
    IF NEW.nombre_archivo !~ '\.(jpg|jpeg|png|pdf)$' THEN
        RAISE EXCEPTION 'Formato de archivo no permitido';
    END IF;
    
    -- Validar cantidad de documentos por usuario
    IF (
        SELECT COUNT(*) 
        FROM documentos_usuario 
        WHERE user_id = NEW.user_id 
        AND tipo_documento = NEW.tipo_documento
    ) >= 2 THEN
        RAISE EXCEPTION 'Límite de documentos excedido para este tipo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de documentos KYC
DROP TRIGGER IF EXISTS validate_kyc_document_trigger ON documentos_usuario;
CREATE TRIGGER validate_kyc_document_trigger
    BEFORE INSERT OR UPDATE ON documentos_usuario
    FOR EACH ROW
    EXECUTE FUNCTION validate_kyc_document();

-- Función de validación de saldos
CREATE OR REPLACE FUNCTION validate_balance_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el saldo no sea negativo
    IF NEW.monto < 0 THEN
        RAISE EXCEPTION 'El saldo no puede ser negativo';
    END IF;
    
    -- Validar moneda soportada
    IF NEW.moneda NOT IN ('USD', 'ARS', 'BRL', 'WLD') THEN
        RAISE EXCEPTION 'Moneda no soportada';
    END IF;
    
    -- Validar límites por moneda
    CASE NEW.moneda
        WHEN 'USD' THEN
            IF NEW.monto > 100000 THEN
                RAISE EXCEPTION 'Excede límite máximo para USD';
            END IF;
        WHEN 'ARS' THEN
            IF NEW.monto > 10000000 THEN
                RAISE EXCEPTION 'Excede límite máximo para ARS';
            END IF;
        WHEN 'BRL' THEN
            IF NEW.monto > 500000 THEN
                RAISE EXCEPTION 'Excede límite máximo para BRL';
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de saldos
DROP TRIGGER IF EXISTS validate_balance_update_trigger ON saldos;
CREATE TRIGGER validate_balance_update_trigger
    BEFORE INSERT OR UPDATE ON saldos
    FOR EACH ROW
    EXECUTE FUNCTION validate_balance_update();

-- Validaciones para notificaciones
DO $$ BEGIN
    ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS check_notification_type;
    ALTER TABLE notificaciones ADD CONSTRAINT check_notification_type 
    CHECK (tipo IN ('sistema', 'transaccion', 'seguridad', 'kyc', 'p2p'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Función de validación de notificaciones
CREATE OR REPLACE FUNCTION validate_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar longitud del título
    IF LENGTH(NEW.titulo) > 100 THEN
        RAISE EXCEPTION 'Título demasiado largo';
    END IF;
    
    -- Validar longitud del mensaje
    IF LENGTH(NEW.mensaje) > 1000 THEN
        RAISE EXCEPTION 'Mensaje demasiado largo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de notificaciones
DROP TRIGGER IF EXISTS validate_notification_trigger ON notificaciones;
CREATE TRIGGER validate_notification_trigger
    BEFORE INSERT OR UPDATE ON notificaciones
    FOR EACH ROW
    EXECUTE FUNCTION validate_notification();

-- Función de validación de configuración de usuario
CREATE OR REPLACE FUNCTION validate_user_config()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar claves permitidas
    IF NEW.clave NOT IN (
        'idioma_preferido',
        'notificaciones_email',
        'notificaciones_push',
        'tema_interfaz',
        'moneda_preferida'
    ) THEN
        RAISE EXCEPTION 'Clave de configuración no válida';
    END IF;
    
    -- Validar valores según la clave
    CASE NEW.clave
        WHEN 'idioma_preferido' THEN
            IF NEW.valor NOT IN ('es', 'en', 'pt') THEN
                RAISE EXCEPTION 'Idioma no soportado';
            END IF;
        WHEN 'notificaciones_email' THEN
            IF NEW.valor NOT IN ('true', 'false') THEN
                RAISE EXCEPTION 'Valor inválido para notificaciones';
            END IF;
        WHEN 'moneda_preferida' THEN
            IF NEW.valor NOT IN ('USD', 'ARS', 'BRL') THEN
                RAISE EXCEPTION 'Moneda no soportada';
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de configuración de usuario
DROP TRIGGER IF EXISTS validate_user_config_trigger ON configuracion_usuario;
CREATE TRIGGER validate_user_config_trigger
    BEFORE INSERT OR UPDATE ON configuracion_usuario
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_config();

-- Políticas RLS adicionales
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Usuarios verificados pueden crear transacciones" ON transacciones
        FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND verificado = true
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios solo pueden ver sus propias transacciones" ON transacciones
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Límite de documentos por tipo" ON documentos_usuario
        FOR INSERT
        TO authenticated
        WITH CHECK (
            (
                SELECT COUNT(*)
                FROM documentos_usuario
                WHERE user_id = auth.uid()
                AND tipo_documento = tipo_documento
            ) < 2
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;