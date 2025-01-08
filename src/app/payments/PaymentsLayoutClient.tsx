'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

function LoadingSpinner() {
  return <Spinner size="lg" className="m-4" />;
}

export default function PaymentsLayoutClient({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  return (
    <div className="payments-container max-w-4xl mx-auto p-4">
      {children}
    </div>
  );
}
