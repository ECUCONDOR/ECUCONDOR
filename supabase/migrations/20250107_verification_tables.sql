-- Verificar el tipo de dato actual de client_id
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('verification_status', 'user_permissions')
  AND column_name = 'client_id';

-- Agregar columnas temporales para almacenar los valores convertidos
ALTER TABLE verification_status ADD COLUMN client_id_temp BIGINT;
ALTER TABLE user_permissions ADD COLUMN client_id_temp BIGINT;

-- Convertir y copiar los valores de client_id a las columnas temporales
UPDATE verification_status
SET client_id_temp = ('x' || substr(md5(client_id::text), 1, 16))::bit(64)::bigint;

UPDATE user_permissions
SET client_id_temp = ('x' || substr(md5(client_id::text), 1, 16))::bit(64)::bigint;

-- Eliminar restricciones y referencias existentes en client_id
ALTER TABLE verification_status DROP CONSTRAINT IF EXISTS verification_status_client_id_fkey;
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_client_id_fkey;

-- Eliminar la columna original client_id
ALTER TABLE verification_status DROP COLUMN client_id;
ALTER TABLE user_permissions DROP COLUMN client_id;

-- Renombrar las columnas temporales a client_id
ALTER TABLE verification_status RENAME COLUMN client_id_temp TO client_id;
ALTER TABLE user_permissions RENAME COLUMN client_id_temp TO client_id;

-- Agregar restricciones y referencias con el nuevo tipo de dato
ALTER TABLE verification_status
ADD CONSTRAINT verification_status_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id);

ALTER TABLE user_permissions
ADD CONSTRAINT user_permissions_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id);

-- Verificar el resultado final
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('verification_status', 'user_permissions')
  AND column_name = 'client_id';
