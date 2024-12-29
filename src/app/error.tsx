'use client'
 
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="rounded-lg bg-destructive/15 p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="text-lg font-semibold">Algo salió mal!</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Se produjo un error al procesar su solicitud.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
