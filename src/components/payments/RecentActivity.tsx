'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Transaction {
  id: string;
  created_at: string;
  tipo: 'exchange';
  monto: number;
  moneda_origen: string;
  moneda_destino: string;
  estado: 'pendiente' | 'completado' | 'rechazado';
  alias: string;
  user_id: string;
}

export function RecentActivity() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([] as Transaction[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      const supabase = createClientComponentClient();
      
      try {
        const { data, error: supabaseError } = await supabase
          .from('transacciones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (supabaseError) throw supabaseError;
        setTransactions(data as Transaction[] || []);
      } catch (err) {
        console.error('Error al obtener transacciones:', err);
        setError('No se pudieron cargar las transacciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const renderTransaction = (transaction: Transaction) => (
    <div key={transaction.id} className="flex justify-between items-center">
      <div>
        <div className="font-medium">
          {transaction.moneda_origen} → {transaction.moneda_destino}
        </div>
        <div className="text-sm text-gray-500">
          Ref: {transaction.alias}
        </div>
        <div className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(transaction.created_at), {
            addSuffix: true,
            locale: es
          })}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className={
          transaction.estado === 'completado' ? 'text-green-500' :
          transaction.estado === 'rechazado' ? 'text-red-500' :
          'text-yellow-500'
        }>
          {transaction.monto.toFixed(2)} {transaction.moneda_origen}
        </div>
        <div className="text-xs text-gray-400 capitalize">
          {transaction.estado}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay transacciones recientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map(renderTransaction)}
      </CardContent>
    </Card>
  );
}
