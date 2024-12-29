'use client';

import { useEffect, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { supabase } from '@/lib/supabase/client';

function SupabaseSessionHandler() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Handle sign out in NextAuth if needed
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!mounted) return null;
  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      <SupabaseSessionHandler />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <main className="min-h-screen bg-background font-sans antialiased">
          {mounted && children}
        </main>
      </ThemeProvider>
    </SessionProvider>
  );
}
