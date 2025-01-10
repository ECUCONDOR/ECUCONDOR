'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { TermsWrapper } from '@/components/TermsWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/image.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/image.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TermsWrapper>
            <Providers>
              <DashboardProvider>
                <div className="min-h-screen relative overflow-hidden bg-[#000B1F]">
                  <div className="relative z-10">
                    {children}
                  </div>
                </div>
                <Toaster />
              </DashboardProvider>
            </Providers>
          </TermsWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}