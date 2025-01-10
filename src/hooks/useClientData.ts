'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

interface DashboardData {
  balance: number;
  transactions_24h: number;
  active_cards: number;
  last_activity: string;
  balance_change: number;
}

const defaultDashboardData: DashboardData = {
  balance: 0,
  transactions_24h: 0,
  active_cards: 0,
  last_activity: 'N/A',
  balance_change: 0
};

export function useClientData(clientId: number | null) {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        const { data: dashboardData, error: dashboardError } = await supabase
          .rpc('get_dashboard_data', { p_client_id: clientId });

        if (dashboardError) {
          throw dashboardError;
        }

        if (!dashboardData) {
          throw new Error('No se encontraron datos del dashboard');
        }

        setData({
          balance: dashboardData.balance ?? 0,
          transactions_24h: dashboardData.transactions_24h ?? 0,
          active_cards: dashboardData.active_cards ?? 0,
          last_activity: dashboardData.last_activity ?? 'N/A',
          balance_change: dashboardData.balance_change ?? 0
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setData(defaultDashboardData);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [clientId]);

  return { data, loading, error };
}

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(0);

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

export const calculateChange = (previous: number | null | undefined, current: number | null | undefined): string => {
  if (!previous || !current) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};
