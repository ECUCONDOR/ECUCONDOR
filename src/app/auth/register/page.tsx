import Image from 'next/image'
import { RegisterForm } from './components/RegisterForm'

export default function RegisterPage() {
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
              Únete a ECUCONDOR
            </h2>
            <p className="text-gray-300">
              Comienza a gestionar tus transacciones internacionales de manera segura
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
              Crear cuenta
            </h1>
            <p className="text-sm text-gray-400">
              Ingresa tus datos para comenzar
            </p>
          </div>

          <div className="relative">
            {/* Efecto de resplandor */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-lg blur opacity-75" />
            <div className="relative border border-[#1E3A6E] rounded-lg p-6 backdrop-blur-sm bg-[#0F2756]/50">
              <RegisterForm />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1E3A6E]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0A1A3B] px-2 text-gray-400">
                  Beneficios de registrarte
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-center">
              <div className="p-4 rounded-lg border border-[#1E3A6E] bg-[#0F2756]/50">
                <h3 className="text-sm font-medium text-white mb-2">Transacciones Seguras</h3>
                <p className="text-xs text-gray-400">Operaciones protegidas con los más altos estándares de seguridad</p>
              </div>
              <div className="p-4 rounded-lg border border-[#1E3A6E] bg-[#0F2756]/50">
                <h3 className="text-sm font-medium text-white mb-2">Soporte 24/7</h3>
                <p className="text-xs text-gray-400">Asistencia personalizada en todo momento</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terms" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
              Términos de servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline">
              Política de privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
