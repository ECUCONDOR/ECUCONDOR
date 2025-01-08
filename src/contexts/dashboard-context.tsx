'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

interface DashboardContextType {
  clientId: number | null;
  loading: boolean;
  error: Error | null;
  refreshClientData: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  clientId: null,
  loading: true,
  error: null,
  refreshClientData: async () => {},
  refetchTransactions: async () => {}
});

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [clientId, setClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const fetchClientData = async () => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    try {
      console.log('Fetching client relation for user:', user.id);
      
      // Primero intentamos obtener mediante RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_current_user_client_id');

      console.log('RPC response:', { data: rpcData, error: rpcError });

      if (!rpcError && rpcData !== null) {
        console.log('Client ID obtained via RPC:', rpcData);
        setClientId(rpcData);
        setError(null);
        return;
      }

      // Si falla el RPC o devuelve null, intentamos con la consulta directa
      console.log('RPC failed or returned null, trying direct query');
      const { data: relation, error: relationError } = await supabase
        .from('user_client_relation')
        .select('client_id, status')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .single();

      console.log('Direct query result:', { relation, error: relationError });

      if (relationError) {
        if (relationError.code === 'PGRST116') {
          console.log('No active client relation found');
          router.replace('/onboarding');
          return;
        }
        throw relationError;
      }

      if (!relation?.client_id) {
        console.log('No client ID found');
        router.replace('/onboarding');
        return;
      }

      console.log('Setting client ID:', relation.client_id);
      setClientId(relation.client_id);
      setError(null);
    } catch (err) {
      console.error('Error fetching client data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(new Error(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [user?.id]);

  const value = {
    clientId,
    loading,
    error,
    refreshClientData: fetchClientData,
    refetchTransactions: async () => {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}

export default DashboardContext;
