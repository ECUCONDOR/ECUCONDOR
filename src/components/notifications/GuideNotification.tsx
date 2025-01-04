'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DollarSign, 
  ArrowRight, 
  Upload, 
  CheckCircle2,
  Info,
  AlertCircle,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  type: 'info' | 'warning' | 'success' | 'tip';
}

const steps: Step[] = [
  {
    id: 1,
    title: '¡Bienvenido a Ecucondor! 🌟',
    description: 'Estamos aquí para ayudarte a enviar dinero entre Argentina y Ecuador de forma fácil y segura.',
    icon: <Rocket className="h-6 w-6" />,
    type: 'info'
  },
  {
    id: 2,
    title: 'Paso 1: Elige tu moneda 💰',
    description: 'Decide si quieres cambiar dólares a pesos argentinos (USD → ARS) o pesos argentinos a dólares (ARS → USD).',
    icon: <DollarSign className="h-6 w-6" />,
    type: 'tip'
  },
  {
    id: 3,
    title: 'Paso 2: Ingresa el monto 🔢',
    description: '¡Es como contar tus juguetes! Escribe cuánto dinero quieres cambiar.',
    icon: <Info className="h-6 w-6" />,
    type: 'info'
  },
  {
    id: 4,
    title: 'Paso 3: Elige un banco 🏦',
    description: 'Selecciona el banco donde quieres recibir tu dinero. ¡Es como elegir en qué alcancía guardarlo!',
    icon: <Lightbulb className="h-6 w-6" />,
    type: 'tip'
  },
  {
    id: 5,
    title: 'Paso 4: Comprobante 📸',
    description: 'Toma una foto de tu comprobante de pago y súbelo. ¡Es como mostrar tu tarea al profesor!',
    icon: <Upload className="h-6 w-6" />,
    type: 'warning'
  },
  {
    id: 6,
    title: '¡Listo para enviar! ✨',
    description: 'Revisa que todo esté correcto y haz clic en "Confirmar Cambio". ¡Es como enviar una carta a un amigo!',
    icon: <CheckCircle2 className="h-6 w-6" />,
    type: 'success'
  }
];

export function GuideNotification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : 1));
    }, 8000); // Cambia cada 8 segundos

    return () => clearInterval(timer);
  }, []);

  const step = steps[currentStep - 1];

  if (!showGuide) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            className={`
              ${step.type === 'info' && 'bg-blue-50 border-blue-200'}
              ${step.type === 'warning' && 'bg-yellow-50 border-yellow-200'}
              ${step.type === 'success' && 'bg-green-50 border-green-200'}
              ${step.type === 'tip' && 'bg-purple-50 border-purple-200'}
              shadow-lg
            `}
          >
            <div className={`
              ${step.type === 'info' && 'text-blue-500'}
              ${step.type === 'warning' && 'text-yellow-500'}
              ${step.type === 'success' && 'text-green-500'}
              ${step.type === 'tip' && 'text-purple-500'}
            `}>
              {step.icon}
            </div>
            <div className="ml-3 flex-1">
              <AlertTitle className="font-medium mb-1">{step.title}</AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                {step.description}
              </AlertDescription>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex space-x-1">
                  {steps.map((s) => (
                    <div
                      key={s.id}
                      className={`h-1.5 w-6 rounded-full transition-colors ${
                        s.id === currentStep
                          ? 'bg-primary'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGuide(false)}
                  className="text-xs"
                >
                  Entendido
                </Button>
              </div>
            </div>
          </Alert>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
