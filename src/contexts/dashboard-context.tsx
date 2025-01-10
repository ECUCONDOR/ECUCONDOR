import { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { type SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

interface Client {
  id: number;
  name: string;
  created_at: string;
  // Add other client fields as needed
}

interface DashboardContextType {
  clientId: number | null;
  clients: Client[];
  loading: boolean;
  error: Error | null;
  refreshClientData: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
  fetchClients: () => Promise<void>;
  supabase: SupabaseClient<Database>;
}

interface ProviderProps {
  children: React.ReactNode;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: ProviderProps) {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();
  const { user, supabase } = useAuth();

  const fetchClientData = async () => {
    if (!user) {
      setClientId(null);
      return;
    }

    try {
      console.log('Fetching client relation for user:', user.id);

      const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_client_id');

      if (rpcError) {
        throw rpcError;
      }

      if (rpcData) {
        setClientId(rpcData);
        setError(null);
      } else {
        setClientId(null);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch client data'));
      setClientId(null);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch client data',
        variant: 'destructive',
      });
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setClients(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
      setClients([]);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch clients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshClientData = async () => {
    setLoading(true);
    await fetchClientData();
    setLoading(false);
  };

  const refetchTransactions = async () => {
    // Implement transaction refetch logic here
    await Promise.resolve();
  };

  useEffect(() => {
    fetchClientData();
    fetchClients();
  }, [user]);

  const value: DashboardContextType = {
    clientId,
    clients,
    loading,
    error,
    refreshClientData,
    refetchTransactions,
    fetchClients,
    supabase,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}

// Exportar también como alias para mantener compatibilidad
export const useDashboard = useDashboardContext;
