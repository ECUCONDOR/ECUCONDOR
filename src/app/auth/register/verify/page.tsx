'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { PublicNavbar } from '@/components/public-navbar';
import { useNotifications } from '@/contexts/NotificationContext';
import { showNotification } from '@/components/Notification';

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
        type: 'signup'
      });

      if (error) throw error;
      router.push('/dashboard');
    } catch (error) {
      console.error('Error verifying email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#000B1F]">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mt-16 bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 text-center">
          <Image
            src="/images/image.svg"
            alt="ECUCONDOR Logo"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold mb-4">Verifica tu correo electrónico</h1>
          <p className="text-gray-400 mb-6">
            Te hemos enviado un correo electrónico con un enlace de verificación.
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo enlace.
            </p>
            <Button
              onClick={() => {
                showNotification(
                  'info',
                  'Correo reenviado',
                  'Hemos enviado un nuevo correo de verificación a tu dirección de email'
                );
              }}
              variant="outline"
              className="mt-4"
            >
              Reenviar correo de verificación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
