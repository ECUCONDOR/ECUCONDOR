'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentService, PaymentMethod } from '@/services/payment.service';

export default function PixPaymentPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixMethod, setPixMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (!currentSession) {
        router.push('/auth/login');
      }
    };

    checkSession();
  }, [supabase, router]);

  useEffect(() => {
    const loadPixMethod = async () => {
      if (!session?.user?.id) {
        setError('Debe iniciar sesión para acceder a los métodos de pago');
        setLoading(false);
        return;
      }

      try {
        const methods = await PaymentService.getUserPaymentMethods(session.user.id);
        const pix = methods.find(m => m.type === 'PIX');
        
        if (!pix) {
          // Si no existe un método PIX, lo creamos
          const newPix = await PaymentService.addPaymentMethod(session.user.id, 'PIX', {
            status: 'pending_activation'
          });
          setPixMethod(newPix);
        } else {
          setPixMethod(pix);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar método PIX');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadPixMethod();
    }
  }, [session]);

  if (!session) {
    return (
      <Alert>
        <AlertDescription>
          Por favor inicia sesión para acceder a los pagos con PIX.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pixMethod) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            No se pudo cargar el método de pago PIX. Por favor, intente nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pago con PIX</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            PIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pixMethod.data.status === 'pending_activation' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para comenzar a usar PIX, necesitamos verificar su información.
              </p>
              <Button>
                Activar PIX
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Su cuenta PIX está activa. Puede realizar pagos instantáneos.
              </p>
              {/* Aquí irían los detalles de la cuenta PIX y opciones de pago */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
