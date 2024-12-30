'use client'
 
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { componentLoggers } from '@/lib/logger'
import { usePathname } from 'next/navigation'

const { ui: logger } = componentLoggers;
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname();

  useEffect(() => {
    logger.error('Client error occurred', {
      pathname,
      errorMessage: error.message,
      errorStack: error.stack,
      errorDigest: error.digest,
    }, error);
  }, [error, pathname]);
 
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-black">
      <div className="rounded-lg bg-white/10 backdrop-blur-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 text-white">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-semibold">¡Algo salió mal!</h2>
        </div>
        <p className="mt-4 text-gray-300">
          {error.message || 'Se produjo un error al procesar su solicitud.'}
        </p>
        {error.digest && (
          <p className="mt-2 text-sm text-gray-400">
            Código de error: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              logger.info('Error reset attempted', { pathname });
              reset();
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  )
}
