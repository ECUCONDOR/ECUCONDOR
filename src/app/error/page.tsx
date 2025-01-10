'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ErrorPage() {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = React.useState(null as string | null);

  React.useEffect(() => {
    // Get error details from localStorage if available
    const details = localStorage.getItem('errorDetails');
    if (details) {
      setErrorDetails(details);
      // Clear the error details
      localStorage.removeItem('errorDetails');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Ha ocurrido un error
          </h1>
          
          {errorDetails && (
            <div className="mb-6 p-4 bg-red-500/10 rounded-lg">
              <p className="text-red-300 text-sm font-mono break-all">
                {errorDetails}
              </p>
            </div>
          )}

          <p className="text-gray-300 mb-6">
            Lo sentimos, ha ocurrido un error al procesar tu solicitud. 
            Por favor, intenta nuevamente o contacta a soporte si el problema persiste.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              Volver al inicio
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
