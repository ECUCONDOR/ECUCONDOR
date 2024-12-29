'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

interface DashboardData {
  saldoActual: number;
  transferencias_pendientes: number;
  ultimosMovimientos: {
    id: string;
    tipo: string;
    monto: number;
    fecha: string;
  }[];
}

export default function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    saldoActual: 0,
    transferencias_pendientes: 0,
    ultimosMovimientos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Obtener el usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No se encontró el usuario');

        // Obtener transacciones pendientes
        const { count: pendingCount, error: pendingError } = await supabase
          .from('transacciones')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('estado', 'pendiente');
        if (pendingError) throw pendingError;

        // Obtener últimos movimientos (transacciones)
        const { data: movimientos, error: movimientosError } = await supabase
          .from('transacciones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (movimientosError) throw movimientosError;

        // Calcular saldo actual basado en transacciones
        const { data: todasTransacciones, error: saldoError } = await supabase
          .from('transacciones')
          .select('monto, tipo')
          .eq('user_id', user.id)
          .eq('estado', 'completada');
        
        if (saldoError) throw saldoError;

        const saldoActual = todasTransacciones?.reduce((acc, trans) => {
          return acc + (trans.tipo === 'ingreso' ? trans.monto : -trans.monto);
        }, 0) || 0;

        setData({
          saldoActual,
          transferencias_pendientes: pendingCount || 0,
          ultimosMovimientos: movimientos?.map(m => ({
            id: m.id,
            tipo: m.tipo,
            monto: m.monto,
            fecha: m.created_at || ''
          })) || []
        });

      } catch (err) {
        console.error('Error en fetchDashboardData:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  return { data, loading, error };
}
