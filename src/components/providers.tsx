'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { Database } from '@/types/supabase';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());

  return (
    <NextThemeProvider
      defaultTheme="system"
      storageKey="theme-preference"
      enableSystem
      disableTransitionOnChange
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        <AuthProvider>
          <main className="min-h-screen bg-background font-sans antialiased">
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </main>
        </AuthProvider>
      </SessionContextProvider>
    </NextThemeProvider>
  );
}
