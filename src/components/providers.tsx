'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}