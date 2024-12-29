'use client';

import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';

interface PaymentsLayoutProps {
  children: React.ReactNode;
}

export default function PaymentsLayout({ children }: PaymentsLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
