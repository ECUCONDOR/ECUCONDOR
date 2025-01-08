'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/useAuth';
import { DashboardProvider } from '@/contexts/dashboard-context';
import TermsAndConditions from '@/components/TermsAndConditions';

const inter = Inter({ subsets: ['latin'] });

function TermsWrapper({ children }: { children: React.ReactNode }) {
  const { showTermsModal, setShowTermsModal, acceptTerms } = useAuth();

  return (
    <>
      {children}
      <TermsAndConditions
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={acceptTerms}
      />
    </>
  );
}

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
          <DashboardProvider>
            <Providers>
              <div className="min-h-screen relative overflow-hidden bg-[#000B1F]">
                <div className="relative z-10">
                  <TermsWrapper>
                    {children}
                  </TermsWrapper>
                </div>
              </div>
              <Toaster />
            </Providers>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}