'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { validateClientAccess } from '@/lib/client-auth'
import { toast } from '@/components/ui/use-toast'

interface UseClientAuthReturn {
  client: any | null
  clientId: string | null
  status: string | null
  loading: boolean
  error: Error | null
  refreshClient: () => Promise<void>
}

export function useClientAuth(): UseClientAuthReturn {
  const [client, setClient] = useState<any | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const fetchClientData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { client, clientId, status } = await validateClientAccess()
      
      setClient(client)
      setClientId(clientId)
      setStatus(status)
    } catch (error) {
      console.error('Error en useClientAuth:', error)
      setError(error instanceof Error ? error : new Error('Error desconocido'))
      
      // Mostrar mensaje de error
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al obtener información del cliente',
        variant: 'destructive'
      })

      // Redirigir según el tipo de error
      if (error instanceof Error) {
        if (error.message.includes('No hay una sesión activa')) {
          router.push('/auth/login')
        } else if (error.message.includes('No hay un cliente asociado')) {
          router.push('/onboarding')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()
  }, [router])

  const refreshClient = async () => {
    await fetchClientData()
  }

  return {
    client,
    clientId,
    status,
    loading,
    error,
    refreshClient
  }
}
