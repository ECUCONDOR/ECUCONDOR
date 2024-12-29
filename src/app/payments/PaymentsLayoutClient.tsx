'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
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
