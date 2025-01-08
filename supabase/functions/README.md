# Edge Functions para Verificación

Este directorio contiene las Edge Functions utilizadas en el proceso de verificación de clientes.

## Funciones Disponibles

### 1. verify-documents

Procesa y verifica los documentos subidos por el usuario.

**Endpoint**: `/functions/v1/verify-documents`

**Método**: POST

**Payload**:
```json
{
  "userId": "string",
  "clientId": "string",
  "documents": [
    {
      "type": "id" | "address" | "business" | "other",
      "path": "string"
    }
  ]
}
```

**Respuesta**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "user_id": "string",
    "client_id": "string",
    "documents": [...],
    "status": "pending",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### 2. verify-client

Verifica el cliente y actualiza los permisos correspondientes.

**Endpoint**: `/functions/v1/verify-client`

**Método**: POST

**Payload**:
```json
{
  "userId": "string",
  "clientId": "string",
  "verificationId": "string"
}
```

**Respuesta**:
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "user_id": "string",
    "client_id": "string",
    "documents": [...],
    "status": "verified",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

## Despliegue

1. Asegúrate de tener la CLI de Supabase instalada:
```bash
npm install -g supabase
```

2. Inicia sesión en Supabase:
```bash
supabase login
```

3. Vincula tu proyecto:
```bash
supabase link --project-ref tu-ref-id
```

4. Despliega las funciones:
```bash
supabase functions deploy verify-documents
supabase functions deploy verify-client
```

## Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas en tu proyecto de Supabase:

- `SUPABASE_URL`: URL de tu proyecto
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio (Service Role Key)

## Uso en el Frontend

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-documents`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
    },
    body: JSON.stringify({
      userId: user.id,
      clientId: client.id,
      documents: [...]
    })
  }
);
```

## Seguridad

Las funciones implementan:
- Autenticación mediante token JWT
- Validación de relación usuario-cliente
- Verificación de permisos
- Manejo seguro de documentos
- Políticas RLS en las tablas relacionadas
