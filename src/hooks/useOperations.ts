import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export interface Operation {
  id: string;
  tipo: string;
  estado: string;
  monto: number;
  moneda_origen: string;
  moneda_destino?: string;
  fecha_operacion: string;
  descripcion: string;
}

export function useOperations() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient<Database>();

  const fetchOperations = async () => {
    try {
      setLoading(true);
      
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Obtener operaciones
      const { data, error: operationsError } = await supabase
        .from('operaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_operacion', { ascending: false });

      if (operationsError) throw operationsError;

      setOperations(data || []);
    } catch (err) {
      console.error('Error fetching operations:', err);
      setError(err instanceof Error ? err.message : 'Error fetching operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();

    // Suscribirse a cambios en operaciones
    const operationsSubscription = supabase
      .channel('operations_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'operaciones',
        }, 
        () => {
          fetchOperations();
        }
      )
      .subscribe();

    return () => {
      operationsSubscription.unsubscribe();
    };
  }, []);

  const createOperation = async (operationData: Omit<Operation, 'id' | 'fecha_operacion'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('operaciones')
        .insert([
          {
            ...operationData,
            user_id: user.id,
            fecha_operacion: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // La operación se actualizará automáticamente a través de la suscripción
      return data;
    } catch (err) {
      console.error('Error creating operation:', err);
      throw err;
    }
  };

  return { 
    operations, 
    loading, 
    error, 
    createOperation,
    refetch: fetchOperations 
  };
}
