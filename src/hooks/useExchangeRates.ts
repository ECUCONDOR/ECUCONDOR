import { useState, useEffect, useCallback } from 'react';
import { BinanceService } from '@/services/binance.service';

interface ExchangeRates {
  USDT_ARS: number;
  USDT_BRL: number;
}

interface UseExchangeRatesReturn {
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
  getRate: (from: string, to: string) => number | null;
  refreshRates: () => Promise<void>;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const binanceService = BinanceService.getInstance();

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener precios de Binance
      const [usdtBrlPrice, usdtArsPrice] = await Promise.all([
        binanceService.getPrice('USDTBRL'),
        // Para ARS, podemos usar DAI como proxy ya que tiene más liquidez en Argentina
        binanceService.getPrice('DAIUSDT').then(daiPrice => 
          // Asumimos una paridad aproximada DAI/USDT y usamos un precio fijo ARS/DAI
          // En producción, esto debería venir de una API local o exchange local
          daiPrice * 850 // Ejemplo: 850 ARS por DAI
        )
      ]);

      setRates({
        USDT_BRL: usdtBrlPrice,
        USDT_ARS: usdtArsPrice,
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError('Error al obtener las tasas de cambio. Por favor, intente nuevamente.');
      console.error('Error fetching exchange rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRate = useCallback((from: string, to: string): number | null => {
    if (!rates) return null;

    // Convertir todo a través de USDT
    if (from === 'USDT') {
      switch (to) {
        case 'ARS':
          return rates.USDT_ARS;
        case 'BRL':
          return rates.USDT_BRL;
        case 'USDT':
          return 1;
        default:
          return null;
      }
    }

    if (to === 'USDT') {
      switch (from) {
        case 'ARS':
          return 1 / rates.USDT_ARS;
        case 'BRL':
          return 1 / rates.USDT_BRL;
        case 'USDT':
          return 1;
        default:
          return null;
      }
    }

    // Conversiones cruzadas (por ejemplo, ARS a BRL)
    const fromRate = getRate(from, 'USDT');
    const toRate = getRate('USDT', to);

    if (fromRate && toRate) {
      return fromRate / toRate;
    }

    return null;
  }, [rates]);

  // Actualizar tasas cada 30 segundos
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    loading,
    error,
    getRate,
    refreshRates: fetchRates,
  };
}
