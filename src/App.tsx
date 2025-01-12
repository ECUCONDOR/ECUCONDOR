import { AuthProvider } from '@/contexts/auth-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { type ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </AuthProvider>
  );
}