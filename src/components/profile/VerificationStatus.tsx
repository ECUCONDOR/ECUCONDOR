'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Upload, Clock } from 'lucide-react';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'in_progress';
}

export default function VerificationStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStep[]>([
    {
      id: 'email',
      title: 'Verificación de Email',
      description: 'Confirma tu dirección de correo electrónico',
      status: 'pending'
    },
    {
      id: 'identity',
      title: 'Verificación de Identidad',
      description: 'Sube un documento de identificación válido',
      status: 'pending'
    },
    {
      id: 'address',
      title: 'Verificación de Domicilio',
      description: 'Comprueba tu dirección de residencia',
      status: 'pending'
    }
  ]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('verification_status')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (error) throw error;

        if (data) {
          setVerificationStatus(prev => prev.map(step => ({
            ...step,
            status: data[step.id] || 'pending'
          })));
        }
      } catch (error) {
        console.error('Error loading verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadVerificationStatus();
    }
  }, [user, supabase]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Upload className="h-6 w-6 text-gray-500" />;
    }
  };

  const getProgress = () => {
    const completed = verificationStatus.filter(step => step.status === 'completed').length;
    return (completed / verificationStatus.length) * 100;
  };

  const handleUpload = async (stepId: string) => {
    toast({
      title: 'Próximamente',
      description: 'La funcionalidad de carga de documentos estará disponible pronto',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Estado de Verificación</h2>
        <Progress value={getProgress()} className="w-full" />
        <p className="text-sm text-gray-500">
          Completa todos los pasos para acceder a todas las funcionalidades
        </p>
      </div>

      <div className="grid gap-4">
        {verificationStatus.map((step) => (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStepIcon(step.status)}
                  <CardTitle>{step.title}</CardTitle>
                </div>
                {step.status !== 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpload(step.id)}
                    disabled={step.status === 'in_progress'}
                  >
                    {step.status === 'in_progress' ? 'En Proceso' : 'Iniciar'}
                  </Button>
                )}
              </div>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {step.status === 'completed' && (
                <p className="text-sm text-green-500">Verificación completada</p>
              )}
              {step.status === 'failed' && (
                <p className="text-sm text-red-500">
                  Verificación fallida. Por favor, intenta nuevamente.
                </p>
              )}
              {step.status === 'in_progress' && (
                <p className="text-sm text-yellow-500">
                  Tu verificación está siendo procesada
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
