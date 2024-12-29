'use client';

import { useEffect } from 'react';

export default function PaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error en producción
    console.error('Error en página de pagos:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Ha ocurrido un error
        </h2>
        <p className="text-gray-600 mb-4">
          Lo sentimos, ha ocurrido un error procesando su solicitud.
        </p>
        <button
          onClick={reset}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );
}
