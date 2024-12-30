import { useState, useEffect } from 'react';
import { useBinanceWebSocket } from './useBinanceWebSocket';

interface MarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
}

interface MarketDataError {
  type: string;
  message: string;
  error: Error;
}

export function useMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const { connected, reconnecting, data, error } = useBinanceWebSocket(symbol);

  useEffect(() => {
    if (data) {
      setMarketData({
        symbol: data.s,
        price: parseFloat(data.c),
        priceChange: parseFloat(data.p),
        priceChangePercent: parseFloat(data.P),
        volume: parseFloat(data.v),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        lastUpdate: new Date(data.E)
      });
    }
  }, [data]);

  return {
    connected,
    reconnecting,
    data: marketData,
    error: error as MarketDataError | null
  };
}
