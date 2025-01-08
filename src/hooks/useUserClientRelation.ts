import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

interface UserClientRelation {
  id: string;
  user_id: string;
  client_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

interface UserClientRelationState {
  hasRelation: boolean;
  status: 'ACTIVE' | 'INACTIVE' | null;
  loading: boolean;
  error: Error | null;
}

export function useUserClientRelation() {
  const [state, setState] = useState<UserClientRelationState>({
    hasRelation: false,
    status: null,
    loading: true,
    error: null
  });

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    let isMounted = true;

    const checkRelation = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              hasRelation: false,
              status: null
            }));
          }
          return;
        }

        const { data, error } = await supabase
          .from('user_client_relation')
          .select('status')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            if (isMounted) {
              setState(prev => ({
                ...prev,
                loading: false,
                hasRelation: false,
                status: null
              }));
            }
            return;
          }
          throw error;
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            hasRelation: true,
            status: data.status,
            error: null
          }));
        }
      } catch (error) {
        console.error('Error checking client relation:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error('Error desconocido')
          }));
        }
      }
    };

    checkRelation();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const checkClientRelation = async (clientId: string): Promise<UserClientRelation | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;

      const { data, error } = await supabase
        .from('user_client_relations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('client_id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking client relation:', error);
      return null;
    }
  };

  const updateClientRelation = async (clientId: string): Promise<UserClientRelation | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;

      const { data, error } = await supabase
        .from('user_client_relations')
        .upsert({
          user_id: session.user.id,
          client_id: clientId,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client relation:', error);
      return null;
    }
  };

  return {
    updateClientRelation,
    checkClientRelation,
    hasRelation: state.hasRelation,
    status: state.status,
    loading: state.loading,
    error: state.error
  };
}
