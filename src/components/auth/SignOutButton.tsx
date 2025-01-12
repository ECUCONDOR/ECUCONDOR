'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
      toast({
        title: '¡Hasta pronto!',
        description: 'Has cerrado sesión exitosamente.',
      })
    } catch (error) {
      toast({
        title: 'Error al cerrar sesión',
        description: 'Por favor intenta nuevamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
    >
      Cerrar sesión
    </Button>
  )
}
