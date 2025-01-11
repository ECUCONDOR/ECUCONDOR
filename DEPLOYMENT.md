# Guía de Despliegue - ECUCONDOR

Esta guía contiene los pasos y configuraciones necesarias para desplegar la aplicación en Vercel.

## Archivos de Configuración

### 1. package.json
Asegúrate de que el archivo `package.json` tenga la siguiente configuración:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### 2. .npmrc
Crea o actualiza el archivo `.npmrc` con:

```ini
registry=https://registry.npmmirror.com/
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
node-linker=hoisted
```

### 3. vercel.json
Asegúrate de tener el archivo `vercel.json` con:

```json
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm build",
  "installCommand": "npm i -g pnpm && pnpm install",
  "framework": "nextjs",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

## Pasos para el Despliegue

1. **Preparación Local**
   ```bash
   # Limpiar caché e instalaciones previas
   rm -rf node_modules .next .pnpm-store
   pnpm store prune
   
   # Instalar dependencias
   pnpm install
   
   # Verificar build local
   pnpm build
   ```

2. **Despliegue en Vercel**
   ```bash
   # Instalar Vercel CLI si no está instalado
   npm i -g vercel
   
   # Desplegar a producción
   vercel --prod
   ```

## Solución de Problemas Comunes

1. **Error de versión de Node.js**
   - Asegúrate de que `"node": "18.x"` esté especificado en `engines` del package.json
   - Vercel usará automáticamente esta versión

2. **Errores de instalación de paquetes**
   - El registro alternativo configurado en `.npmrc` ayuda con problemas de conectividad
   - Las versiones fijas en package.json previenen incompatibilidades

3. **Errores de build**
   - Verifica que todas las dependencias estén correctamente listadas en package.json
   - Asegúrate de que next.js esté al inicio de las dependencias
   - Usa versiones fijas (sin ^) para todas las dependencias

## Dominios

La aplicación estará disponible en:
- Production: https://ecucondor-ecucondorsas.vercel.app
- Preview (main): https://ecucondor-git-main-ecucondorsas.vercel.app

## Variables de Entorno

Asegúrate de configurar todas las variables de entorno necesarias en el dashboard de Vercel:
1. Ve a Settings > Environment Variables
2. Copia las variables desde tu archivo `.env.production`
3. No olvides incluir las variables específicas de producción
