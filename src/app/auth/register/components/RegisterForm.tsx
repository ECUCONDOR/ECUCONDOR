'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      await signUp(email, password)
      toast({
        title: '¡Registro exitoso!',
        description: 'Por favor verifica tu correo electrónico para continuar.',
      })
      router.push('/auth/verify-email')
    } catch (error) {
      toast({
        title: 'Error al registrarse',
        description: 'Por favor verifica tus datos e intenta nuevamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[#0A1A3B] border-[#1E3A6E] text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[#0A1A3B] border-[#1E3A6E] text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full bg-[#0A1A3B] border-[#1E3A6E] text-white placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors duration-200"
        disabled={isLoading}
      >
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </Button>
      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/auth/login" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </form>
  )
}
