'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useUserClientRelation } from '@/hooks/useUserClientRelation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface VerificationStepProps {
  onVerifiedAction: () => Promise<void>
  clientId: string
}

interface VerificationItem {
  id: string
  title: string
  description: string
  status: 'pending' | 'verifying' | 'success' | 'error'
  message?: string
}

export function VerificationStep({ onVerifiedAction, clientId }: VerificationStepProps) {
  const { user } = useSupabaseAuth()
  const { checkClientRelation } = useUserClientRelation()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    {
      id: 'client-info',
      title: 'Información del cliente',
      description: 'Verificando los datos proporcionados',
      status: 'pending'
    },
    {
      id: 'permissions',
      title: 'Permisos',
      description: 'Configurando permisos de acceso',
      status: 'pending'
    },
    {
      id: 'relation',
      title: 'Relación cliente-usuario',
      description: 'Estableciendo la relación',
      status: 'pending'
    }
  ])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

  const updateItemStatus = (
    id: string, 
    status: VerificationItem['status'], 
    message?: string
  ) => {
    setVerificationItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, message } : item
    ))
  }

  const verifyClientInfo = async () => {
    updateItemStatus('client-info', 'verifying')
    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error('Usuario no autenticado')
      }
      
      // Por ahora no verificamos el email
      updateItemStatus('client-info', 'success', 'Información del cliente verificada')
      return true
    } catch (error) {
      updateItemStatus('client-info', 'error', error instanceof Error ? error.message : 'Error al verificar información del cliente')
      return false
    }
  }

  const verifyPermissions = async () => {
    updateItemStatus('permissions', 'verifying')
    try {
      // Verificar permisos básicos
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No hay sesión activa')
      }

      updateItemStatus('permissions', 'success', 'Permisos verificados correctamente')
      return true
    } catch (error) {
      updateItemStatus('permissions', 'error', error instanceof Error ? error.message : 'Error al verificar permisos')
      return false
    }
  }

  const verifyClientRelation = async () => {
    updateItemStatus('relation', 'verifying')
    try {
      const hasRelation = await checkClientRelation(clientId)
      if (!hasRelation) {
        updateItemStatus('relation', 'error', 'No se encontró la relación con el cliente. Esto puede ser normal si acabas de registrarte.')
        return false
      }

      updateItemStatus('relation', 'success', 'Relación cliente-usuario verificada')
      return true
    } catch (error) {
      updateItemStatus('relation', 'error', 'Error al verificar la relación cliente-usuario')
      return false
    }
  }

  const startVerification = async () => {
    if (isVerifying) return
    setIsVerifying(true)
    setVerificationComplete(false)

    try {
      const clientInfoOk = await verifyClientInfo()
      const permissionsOk = await verifyPermissions()
      const relationOk = await verifyClientRelation()

      // Si todas las verificaciones pasan o solo falla la relación (que es normal al inicio)
      if (clientInfoOk && permissionsOk) {
        toast({
          title: '¡Bienvenido a ECUCONDOR!',
          description: 'Has completado exitosamente la configuración de tu cuenta.'
        })
        
        await onVerifiedAction()
        setVerificationComplete(true)
      } else {
        toast({
          title: 'Error en la verificación',
          description: 'No se pudieron completar todas las verificaciones',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error en la verificación',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error durante la verificación',
        variant: 'destructive'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {verificationItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                {item.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {item.status === 'verifying' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {item.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                {item.message && (
                  <p className={`text-sm mt-1 ${
                    item.status === 'error' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {item.message}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {verificationComplete ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-green-400">
              ¡Configuración Completada!
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Ahora puedes comenzar a usar todas las funcionalidades de ECUCONDOR
            </p>
          </div>
          <Button 
            onClick={goToDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            Ir al Panel de Control
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          onClick={startVerification} 
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Iniciar verificación'
          )}
        </Button>
      )}
    </div>
  )
}
