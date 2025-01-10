-- Insertar roles básicos
INSERT INTO roles (nombre) VALUES
    ('administrador'),
    ('usuario'),
    ('operador')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar tipos de cambio iniciales
INSERT INTO tipos_cambio (par_monedas, valor, activo) VALUES
    ('USD/ARS', 1000.50, true),
    ('BRL/ARS', 175.25, true),
    ('BRL/USD', 0.21, true),
    ('BTC/USD', 94537.41, true),
    ('WLD/USD', 1.82, true)
ON CONFLICT (par_monedas) DO UPDATE 
SET valor = EXCLUDED.valor,
    fecha_actualizacion = TIMEZONE('UTC'::TEXT, NOW());

-- Insertar configuraciones globales del sistema
INSERT INTO configuracion_usuario (user_id, clave, valor)
SELECT 
    auth.uid(),
    'idioma_preferido',
    'es'
FROM auth.users
WHERE auth.users.id = auth.uid()
ON CONFLICT (user_id, clave) DO NOTHING;

-- Insertar configuración de notificaciones por defecto
INSERT INTO configuracion_usuario (user_id, clave, valor)
SELECT 
    auth.uid(),
    'notificaciones_email',
    'true'
FROM auth.users
WHERE auth.users.id = auth.uid()
ON CONFLICT (user_id, clave) DO NOTHING;
