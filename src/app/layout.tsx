import { AuthProvider } from '@/contexts/auth-context';
import { PanelControlProvider } from '@/contexts/dashboard-context';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECUCONDOR',
  description: 'Sistema de gestión financiera',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/image.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <PanelControlProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </PanelControlProvider>
        </AuthProvider>
      </body>
    </html>
  );
}