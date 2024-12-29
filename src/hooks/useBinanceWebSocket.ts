'use client';

import { useState, useEffect, useRef } from 'react';

interface BinanceTickerData {
  s: string;  // Symbol
  c: string;  // Current price
  P: string;  // Price change percent
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdate: Date;
}

interface WebSocketError {
  type: string;
  message: string;
  error?: Error;
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const UPDATE_INTERVAL = 20000; // 20 segundos
const RECONNECT_DELAY = 5000; // 5 segundos
const MAX_RETRIES = 3;

export const useBinanceWebSocket = (symbols: string[]) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [error, setError] = useState<WebSocketError | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const handleError = (type: string, message: string, error?: Error) => {
    const wsError: WebSocketError = {
      type,
      message: message || 'Error de conexión con Binance',
      error
    };
    console.error('WebSocket Error:', wsError);
    setError(wsError);
  };

  const connect = () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      wsRef.current = new WebSocket(BINANCE_WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket Connected');
        retryCountRef.current = 0;
        setError(null);

        const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
        const subscribeMsg = {
          method: 'SUBSCRIBE',
          params: streams,
          id: 1
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(subscribeMsg));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: BinanceTickerData = JSON.parse(event.data);
          if (data.s && data.c && data.P) {
            const priceData: PriceData = {
              symbol: data.s,
              price: parseFloat(data.c),
              change24h: parseFloat(data.P),
              lastUpdate: new Date()
            };

            setPrices(prev => {
              const index = prev.findIndex(p => p.symbol === priceData.symbol);
              if (index === -1) {
                return [...prev, priceData];
              }
              const newPrices = [...prev];
              newPrices[index] = priceData;
              return newPrices;
            });
          }
        } catch (err) {
          console.warn('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!event.wasClean) {
          handleError('CLOSE', 'Conexión cerrada inesperadamente');
          if (retryCountRef.current < MAX_RETRIES) {
            reconnectTimeoutRef.current = setTimeout(() => {
              retryCountRef.current += 1;
              connect();
            }, RECONNECT_DELAY);
          }
        }
      };

      wsRef.current.onerror = (event) => {
        handleError('ERROR', 'Error en la conexión WebSocket', event.error);
      };

    } catch (err) {
      handleError('CONNECT', 'Error al establecer la conexión WebSocket', err instanceof Error ? err : new Error(String(err)));
    }
  };

  useEffect(() => {
    connect();

    const intervalId = setInterval(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
        const unsubscribeMsg = {
          method: 'UNSUBSCRIBE',
          params: streams,
          id: 1
        };

        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(unsubscribeMsg));
          wsRef.current.close();
        }
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [symbols]);

  return { prices, error };
};
