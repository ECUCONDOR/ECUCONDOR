import { Suspense } from 'react';
import PaymentsLayoutContent from './PaymentsLayout.client';

export const metadata = {
  title: 'Pagos - ECUCONDOR',
  description: 'Sistema de pagos ECUCONDOR'
};

export const dynamic = 'force-dynamic';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PaymentsLayoutContent>
      {children}
    </PaymentsLayoutContent>
  );
}
