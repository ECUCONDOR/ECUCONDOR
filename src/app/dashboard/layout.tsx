'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PanelControlProvider } from '@/contexts/dashboard-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No authenticated user, redirecting to login');
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  // Mientras se verifica la autenticación, mostramos un loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1421]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, no renderizamos nada
  if (!user) {
    return null;
  }

  // Si hay usuario autenticado, renderizamos el panel de control
  return (
    <PanelControlProvider>
      {children}
    </PanelControlProvider>
  );
}
