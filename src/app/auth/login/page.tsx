import Image from 'next/image'
import { LoginForm } from './components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Panel de la izquierda - Imagen/Gradiente */}
      <div className="hidden md:block relative bg-gradient-to-br from-[#0A1A3B] via-[#1E3A6E] to-[#0A1A3B] overflow-hidden">
        <Image
          src="/images/image.svg"
          alt="Ilustración decorativa"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A3B]/80 via-[#1E3A6E]/50 to-[#0A1A3B]/80" />
        <div className="relative h-full flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Bienvenido a ECUCONDOR
            </h2>
            <p className="text-gray-300">
              Tu plataforma de gestión financiera integral
            </p>
          </div>
        </div>
      </div>

      {/* Panel de la derecha - Formulario */}
      <div className="flex flex-col justify-center p-4 sm:p-8 lg:p-12 bg-[#0A1A3B]">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <div className="relative">
            {/* Efecto de resplandor */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-lg blur opacity-75" />
            <div className="relative border border-[#1E3A6E] rounded-lg p-6 backdrop-blur-sm bg-[#0F2756]/50">
              <LoginForm />
            </div>
          </div>

          <p className="px-8 text-center text-sm text-gray-400">
            Al continuar, aceptas nuestros{' '}
            <a href="/terms" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
              Términos de servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
              Política de privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
