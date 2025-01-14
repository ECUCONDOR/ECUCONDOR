import { useState, useEffect } from 'react';
import { Currency, ExchangeRate } from '@/types/transactions';

interface UseExchangeRateProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount?: number;
}

interface UseExchangeRateResult {
  rate: number | null;
  convertedAmount: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useExchangeRate({
  fromCurrency,
  toCurrency,
  amount,
}: UseExchangeRateProps): UseExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchExchangeRate() {
      if (fromCurrency.code === toCurrency.code) {
        setRate(1);
        setLastUpdated(new Date());
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        const response = await fetch(
          `/api/exchange-rates?from=${fromCurrency.code}&to=${toCurrency.code}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data: ExchangeRate = await response.json();
        
        if (isMounted) {
          setRate(data.rate);
          setLastUpdated(data.timestamp);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch exchange rate');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchExchangeRate();

    // Refresh rate every 5 minutes
    const intervalId = setInterval(fetchExchangeRate, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fromCurrency.code, toCurrency.code]);

  const convertedAmount = amount && rate ? amount * rate : null;

  return {
    rate,
    convertedAmount,
    isLoading,
    error,
    lastUpdated,
  };
}
