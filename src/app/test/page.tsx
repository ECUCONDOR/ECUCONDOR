'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/supabase';

export default function TestPage() {
  const [status, setStatus] = useState('Probando conexión...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  
  useEffect(() => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function testConnection() {
      try {
        setIsLoading(true);
        console.log('Testing Supabase connection...');
        
        // Test API endpoint
        const apiResponse = await fetch('/api/test-connection');
        const apiData = await apiResponse.json();
        
        if (!apiResponse.ok) {
          console.error('API Error:', apiData);
          setStatus('Error en el endpoint API');
          setError(apiData.error || 'Error desconocido');
          setConnectionDetails(apiData);
          return;
        }

        setStatus('Conexión exitosa');
        setError('');
        setConnectionDetails(apiData);
        console.log('Connection details:', apiData);
      } catch (err) {
        console.error('Error:', err);
        setStatus('Error inesperado');
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    }

    testConnection();
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Test de Conexión</h1>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            {isLoading ? (
              <p className="text-muted-foreground">Verificando conexión...</p>
            ) : (
              <>
                <p className="font-semibold">{status}</p>
                {error && (
                  <p className="text-destructive mt-2">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
          
          {connectionDetails && !isLoading && (
            <div className="p-4 rounded-lg border bg-muted">
              <h2 className="font-medium mb-2">Detalles de la conexión:</h2>
              <div className="space-y-2">
                <p>Estado de autenticación: {connectionDetails.auth?.session || 'No disponible'}</p>
                <p>Perfiles encontrados: {connectionDetails.data?.profiles || 0}</p>
                <p>Variables de entorno: {
                  connectionDetails.env?.hasUrl && connectionDetails.env?.hasKey 
                    ? '✅ Configuradas correctamente'
                    : '❌ Falta configuración'
                }</p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg border bg-muted">
            <p className="font-medium mb-2">Verificando:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className={isLoading ? 'opacity-50' : ''}>Conexión al endpoint API</li>
              <li className={isLoading ? 'opacity-50' : ''}>Variables de entorno</li>
              <li className={isLoading ? 'opacity-50' : ''}>Autenticación de Supabase</li>
              <li className={isLoading ? 'opacity-50' : ''}>Acceso a la base de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
