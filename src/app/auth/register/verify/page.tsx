'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { PublicNavbar } from '@/components/public-navbar';
import { showNotification } from '@/components/Notification';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        showNotification(
          'error',
          'Error de verificación',
          'El enlace de verificación no es válido o ha expirado.'
        );
      } else {
        showNotification(
          'success',
          'Verificación exitosa',
          'Tu correo electrónico ha sido verificado correctamente.'
        );
        router.push('/auth/login');
      }
    } catch (error) {
      showNotification(
        'error',
        'Error',
        'Ha ocurrido un error al verificar tu correo electrónico.'
      );
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/images/image.svg"
                  alt="ECUCONDOR Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-white text-center">
                Verificación de Correo Electrónico
              </h1>
              <p className="text-gray-300 text-center">
                Por favor, espera mientras verificamos tu correo electrónico...
              </p>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
