'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketState = {
  connected: boolean;
  lastMessage: any;
  reconnectAttempt: number;
};

type WebSocketError = {
  type: string;
  message: string;
  error: Error;
} | null;

const initialState: WebSocketState = {
  connected: false,
  lastMessage: null,
  reconnectAttempt: 0,
};

export const useBinanceWebSocket = (symbols: string[]) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [state, setState] = useState<WebSocketState>(initialState);
  const [error, setError] = useState<WebSocketError>(null as WebSocketError);
  const [prices, setPrices] = useState<Array<{ symbol: string; price: string }>>([]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols.map(symbol => symbol.toLowerCase()).join('@trade/')}@trade`);
      
      ws.current.onopen = () => {
        setState(prev => ({
          ...prev,
          connected: true,
          reconnectAttempt: 0
        }));
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            lastMessage: data
          }));
          setPrices(prev => {
            const index = prev.findIndex(p => p.symbol === data.s);
            if (index >= 0) {
              const newPrices = [...prev];
              newPrices[index] = { symbol: data.s, price: data.p };
              return newPrices;
            }
            return [...prev, { symbol: data.s, price: data.p }];
          });
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setState(prev => ({ 
          ...prev, 
          connected: false
        }));
      };

      ws.current.onclose = () => {
        setState(prev => ({ 
          ...prev, 
          connected: false,
          reconnectAttempt: prev.reconnectAttempt + 1
        }));
        
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt reconnection after a delay
        if (state.reconnectAttempt < 5) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.min(1000 * Math.pow(2, state.reconnectAttempt), 30000)); // Exponential backoff with max 30s
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        setError({
          type: 'CONNECTION_ERROR',
          message: 'Failed to establish WebSocket connection',
          error
        });
      }
    }
  }, [symbols]); // Only depend on symbols

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]); // connect is stable now due to limited dependencies

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setState(prev => ({ ...prev, connected: false }));
    }
  }, []);

  return {
    connected: state.connected,
    lastMessage: state.lastMessage,
    error,
    prices,
    disconnect
  };
};