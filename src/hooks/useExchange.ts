import { useState, useEffect } from 'react';
import { ExchangeService, ExchangeRate, ExchangeTransaction, ExchangeDirection } from '@/lib/exchange';
import { useAuth } from '@/hooks/useAuth';

export function useExchange() {
  const { user } = useAuth();
  const [exchangeService] = useState(() => new ExchangeService());
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: 1315,
    timestamp: Date.now()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<ExchangeTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rate = await exchangeService.getExchangeRate();
        setExchangeRate(rate);
      } catch (err) {
        setError('Error al obtener la tasa de cambio');
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [exchangeService]);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  const fetchTransactions = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await exchangeService.getUserTransactions(user.id);
      if (error) throw error;
      if (data) setTransactions(data);
    } catch (err) {
      setError('Error al obtener las transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExchange = (
    amount: string | number,
    direction: ExchangeDirection
  ) => {
    return exchangeService.calculateExchange(amount, direction, exchangeRate.rate);
  };

  const createTransaction = async (data: {
    amount: number;
    targetCurrency: 'USD' | 'ARS';
    bankAccount?: string;
    comprobante: string;
    alias: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: transactionError } = await exchangeService.createExchangeTransaction(data);
      if (transactionError) throw transactionError;
      
      await fetchTransactions(); // Actualizar lista de transacciones
      return { success: true };
    } catch (err) {
      setError('Error al crear la transacción');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exchangeRate,
    transactions,
    isLoading,
    error,
    calculateExchange,
    createTransaction,
    refreshTransactions: fetchTransactions
  };
}
