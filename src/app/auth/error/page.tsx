'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  useEffect(() => {
    if (error) {
      console.error('Error de autenticación:', {
        error,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }
  }, [error])

  const getErrorMessage = (errorCode: string | null | undefined): string => {
    switch (errorCode?.toLowerCase()) {
      case 'configuration':
        return 'Error de configuración del sistema. Por favor, contacte al administrador.'
      case 'accessdenied':
        return 'Acceso denegado. No tiene permisos para acceder a este recurso.'
      case 'verification':
        return 'Error de verificación. Por favor, intente nuevamente.'
      case 'sessionrequired':
        return 'Se requiere iniciar sesión para acceder a este recurso.'
      case 'unauthorized':
        return 'No está autorizado para acceder a este recurso.'
      default:
        return 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de Autenticación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al inicio de sesión
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
