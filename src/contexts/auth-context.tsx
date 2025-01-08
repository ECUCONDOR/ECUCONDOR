'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  hasAcceptedTerms: boolean;
  showTermsModal: boolean;
  setShowTermsModal: (show: boolean) => void;
  acceptTerms: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecucondor_terms_accepted') === 'true';
    }
    return false;
  });
  const [showTermsModal, setShowTermsModal] = useState(!hasAcceptedTerms);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const acceptTerms = () => {
    localStorage.setItem('ecucondor_terms_accepted', 'true');
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
  };

  useEffect(() => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
    }
  }, [hasAcceptedTerms]);

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

    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.session) {
      router.push('/dashboard');
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasAcceptedTerms,
    showTermsModal,
    setShowTermsModal,
    acceptTerms,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
