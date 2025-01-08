'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { useUserClientRelation } from './useUserClientRelation';

interface DashboardData {
  saldos: {
    disponible: number;
    bloqueado: number;
    total: number;
  };
  limites: {
    diario: number;
    mensual: number;
    uso_diario: number;
    uso_mensual: number;
  };
  transferencias_pendientes: number;
  metodos_pago: Array<{
    id: string;
    metodo: string;
    alias: string;
    activo: boolean;
  }>;
  ultimosMovimientos: Array<{
    id: string;
    tipo: 'ingreso' | 'egreso' | 'transferencia';
    monto: number;
    saldo_anterior: number;
    saldo_posterior: number;
    descripcion?: string;
    referencia?: string;
    fecha: string;
  }>;
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
}

export default function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();
  const { hasRelation, clientId, loading: clientLoading, error: clientError } = useUserClientRelation();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Don't fetch if there's no client relation
      if (!hasRelation || !clientId) {
        setData(null);
        return;
      }

      // Obtener estadísticas del cliente
      const { data: clientStats, error: statsError } = await supabase
        .from('client_stats')
        .select('*')
        .eq('client_id', clientId)
        .single();
      if (statsError) throw new Error('Error al obtener estadísticas: ' + statsError.message);

      // Obtener transacciones pendientes
      const { count: pendingCount, error: pendingError } = await supabase
        .from('transacciones')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('estado', 'PENDIENTE');
      if (pendingError) throw new Error('Error al obtener transacciones pendientes: ' + pendingError.message);

      // Obtener métodos de pago
      const { data: metodosPago, error: metodosError } = await supabase
        .from('metodos_pago_usuario')
        .select('*')
        .eq('client_id', clientId)
        .eq('activo', true);
      if (metodosError) throw new Error('Error al obtener métodos de pago: ' + metodosError.message);

      // Obtener últimos movimientos
      const { data: movimientos, error: movimientosError } = await supabase
        .from('movimientos')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (movimientosError) throw new Error('Error al obtener movimientos: ' + movimientosError.message);

      setData({
        saldos: {
          disponible: clientStats.saldo_disponible || 0,
          bloqueado: clientStats.saldo_bloqueado || 0,
          total: (clientStats.saldo_disponible || 0) + (clientStats.saldo_bloqueado || 0)
        },
        limites: {
          diario: clientStats.limite_diario || 5000,
          mensual: clientStats.limite_mensual || 50000,
          uso_diario: clientStats.uso_diario || 0,
          uso_mensual: clientStats.uso_mensual || 0
        },
        transferencias_pendientes: pendingCount || 0,
        metodos_pago: metodosPago?.map(m => ({
          id: m.id,
          metodo: m.metodo,
          alias: m.alias || '',
          activo: m.activo
        })) || [],
        ultimosMovimientos: movimientos?.map(m => ({
          id: m.id,
          tipo: m.tipo,
          monto: m.monto,
          saldo_anterior: m.saldo_anterior,
          saldo_posterior: m.saldo_posterior,
          descripcion: m.descripcion || '',
          referencia: m.referencia || '',
          fecha: m.created_at
        })) || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientLoading) {
      if (clientError) {
        setError(clientError);
        setData(null);
      } else {
        fetchDashboardData();
      }
    }
  }, [clientId, hasRelation, clientLoading, clientError]);

  const mutate = async () => {
    await fetchDashboardData();
  };

  return {
    data,
    loading: loading || clientLoading,
    error: error || clientError,
    mutate
  };
}
