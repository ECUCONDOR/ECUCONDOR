import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type UserClientRelation = Database['public']['Tables']['user_client_relation']['Row'];

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
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            hasRelation: !!data,
            status: data?.status ?? null,
            error: null
          }));
        }
      } catch (error) {
        console.error('Error checking relation:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error')
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
        .from('user_client_relation')
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
        .from('user_client_relation')
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
