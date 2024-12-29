'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { Database } from '@/types/supabase';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        <AuthProvider>
          <main className="min-h-screen bg-background font-sans antialiased">
            {children}
          </main>
        </AuthProvider>
      </SessionContextProvider>
    </ThemeProvider>
  );
}
