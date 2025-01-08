'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onNextAction: () => void;
}

export default function WelcomeStep({ onNextAction }: WelcomeStepProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <h2 className="text-xl font-semibold mb-4">¡Bienvenido a ECUCONDOR!</h2>
      <div className="space-y-4">
        <p>
          Estamos emocionados de tenerte aquí. En los siguientes pasos:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Configuraremos tu perfil de cliente</li>
          <li>Verificaremos tu información</li>
          <li>Prepararemos todo para que puedas comenzar</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          El proceso tomará solo unos minutos. Puedes guardar tu progreso y continuar más tarde si lo necesitas.
        </p>
      </div>
      <Button onClick={onNextAction} className="w-full mt-6">
        Comenzar
      </Button>
    </Card>
  )
}
