'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface DashboardData {
  balance: number;
  transactions_24h: number;
  active_cards: number;
  last_activity: string;
  balance_change: number;
}

export function useClientData(clientId: number | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchDashboardData() {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        const { data: dashboardData, error: dashboardError } = await supabase
          .rpc('get_dashboard_data');

        if (dashboardError) {
          throw dashboardError;
        }

        if (!dashboardData) {
          throw new Error('No se encontraron datos del dashboard');
        }

        setData({
          balance: dashboardData.balance,
          transactions_24h: dashboardData.transactions_24h,
          active_cards: dashboardData.active_cards,
          last_activity: dashboardData.last_activity,
          balance_change: dashboardData.balance_change
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [clientId, supabase]);

  return { data, loading, error };
}

// Función auxiliar para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

// Función auxiliar para calcular el cambio porcentual
export const calculateChange = (previous: number | null | undefined, current: number | null | undefined): string => {
  if (!previous || !current) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};
