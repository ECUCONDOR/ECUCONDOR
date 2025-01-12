'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import WelcomeStep from './components/WelcomeStep';
import { ClientSelectionStep } from './components/ClientSelectionStep';
import { Steps } from '@/types/onboarding';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.Welcome);
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const progress = (() => {
    switch (currentStep) {
      case Steps.Welcome:
        return 33;
      case Steps.ClientSelection:
        return 66;
      case Steps.Complete:
        return 100;
      default:
        return 0;
    }
  })();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleClientSelectionAction = async (clientId: string) => {
    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Convertir clientId a número
      const numericClientId = parseInt(clientId, 10);
      if (isNaN(numericClientId)) {
        throw new Error('ID de cliente inválido');
      }

      // Desactivar relaciones anteriores si existen
      const { error: updateError } = await supabase
        .from('user_client_relation')
        .update({ status: 'INACTIVE' })
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE');

      if (updateError) {
        console.error('Error al actualizar relaciones anteriores:', updateError);
        throw updateError;
      }

      // Crear nueva relación con el cliente
      const { error: createError } = await supabase
        .from('user_client_relation')
        .insert([
          {
            user_id: user.id,
            client_id: numericClientId,
            status: 'ACTIVE'
          }
        ]);

      if (createError) {
        console.error('Error al crear relación:', createError);
        throw createError;
      }

      // Verificar la relación usando la Edge Function
      const { data: clientData, error: clientError } = await supabase.functions
        .invoke('get-client-relation');

      console.log('Client Data:', clientData);
      
      if (clientError) {
        console.error("Error al obtener relación con cliente:", clientError);
        throw clientError;
      }

      if (!clientData?.client_id || clientData.status !== 'ACTIVE') {
        throw new Error('Cliente no encontrado o inactivo');
      }

      // Mostrar mensaje de éxito
      toast({
        title: "¡Bienvenido!",
        description: "Tu cuenta ha sido configurada correctamente.",
      });
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al configurar el cliente:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo completar la configuración. Por favor, intenta nuevamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <Progress value={progress} className="mb-8" />

              {currentStep === Steps.Welcome && (
                <WelcomeStep onNextAction={() => setCurrentStep(Steps.ClientSelection)} />
              )}
              {currentStep === Steps.ClientSelection && (
                <ClientSelectionStep onNextAction={handleClientSelectionAction} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
