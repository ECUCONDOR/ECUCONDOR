import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface UserClientRelation {
  client_id: string;
}

export const useUserClient = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        // Verificar si hay una sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No hay sesión activa');
        }

        // Obtener el client_id asociado al usuario
        const { data, error } = await supabase
          .from('user_client_relation')
          .select('client_id')
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error('Usuario no asociado a ningún cliente');
        }

        setClientId(data.client_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el cliente asociado');
        setClientId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClientId();
  }, [supabase]);

  return { clientId, loading, error };
};
