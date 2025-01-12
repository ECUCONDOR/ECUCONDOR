'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { signIn } from '../../actions'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await signIn(formData)
      if (result?.error) {
        toast({
          title: 'Error al iniciar sesión',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: 'Por favor verifica tus credenciales e intenta nuevamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          className="w-full bg-[#0A1A3B] border-[#1E3A6E] text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          className="w-full bg-[#0A1A3B] border-[#1E3A6E] text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors duration-200"
        disabled={isLoading}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
      <div className="text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="/auth/register" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </form>
  )
}
