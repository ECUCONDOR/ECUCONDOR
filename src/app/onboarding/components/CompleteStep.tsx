'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface CompleteStepProps {
  onCompleteAction: () => Promise<void>
}

export function CompleteStep({ onCompleteAction }: CompleteStepProps) {
  return (
    <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">¡Todo listo!</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Has completado exitosamente la configuración de tu cuenta.
          Ahora puedes comenzar a usar todas las funcionalidades de ECUCONDOR.
        </p>

        <div className="bg-white p-4 rounded-lg">
          <h3 className="font-medium mb-2">Próximos pasos:</h3>
          <ul className="text-left text-sm space-y-2">
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Explora tu panel de control
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Revisa tus configuraciones
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Comienza a realizar operaciones
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Si necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.
        </p>

        <Button onClick={onCompleteAction} className="w-full mt-4">
          Ir al panel de control
        </Button>
      </div>
    </Card>
  )
}
