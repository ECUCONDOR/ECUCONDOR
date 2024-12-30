'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { componentLoggers } from '@/lib/logger';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

const { ui: logger } = componentLoggers;

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    logger.warn('404 page accessed', { pathname });
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-black">
        <div className="text-center px-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Image
              src="/images/image.svg"
              alt="ECUCONDOR Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">404 - Página no encontrada</h1>
          <p className="text-gray-300 mb-8">Lo sentimos, la página que buscas no existe.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
