'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showTermsModal: boolean;
  setShowTermsModal: (show: boolean) => void;
  acceptTerms: () => void;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    user: User | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const acceptTerms = () => {
    setShowTermsModal(false);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        error,
        user: data?.user ?? null
      };
    } catch (error) {
      return {
        error: error as AuthError,
        user: null
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push('/auth/login');
      }
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      showTermsModal,
      setShowTermsModal,
      acceptTerms,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
