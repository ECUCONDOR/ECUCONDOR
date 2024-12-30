import { useEffect, useRef, useState } from 'react';

interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
}

interface WebSocketError {
  type: string;
  message: string;
  error: Error;
}

interface BinanceWebSocketData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  c: string; // Last price
  Q: string; // Last quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

interface BinancePrice {
  symbol: string;
  price: string;
}

export function useBinanceWebSocket(symbols: string | string[]) {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    reconnecting: false,
  });
  const [prices, setPrices] = useState<BinancePrice[]>([]);
  const [data, setData] = useState<BinanceWebSocketData | null>(null);
  const [error, setError] = useState<WebSocketError | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleError = (type: string, message: string, error: Error) => {
    setError({ type, message, error });
    setState(prev => ({ ...prev, connected: false }));
  };

  const connect = () => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) return;

      const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbolString.toLowerCase()}@ticker`);

      ws.current.onopen = () => {
        setState({ connected: true, reconnecting: false });
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setData(data);
          const price = { symbol: data.s, price: data.c };
          setPrices(prev => [...prev.filter(p => p.symbol !== price.symbol), price]);
        } catch (error) {
          if (error instanceof Error) {
            handleError('PARSE', 'Error parsing WebSocket data', error);
          }
        }
      };

      ws.current.onclose = () => {
        setState(prev => ({ ...prev, connected: false }));
        handleError('CLOSE', 'Connection closed unexpectedly', new Error('WebSocket connection closed'));
        // Attempt to reconnect
        if (!state.reconnecting) {
          setState(prev => ({ ...prev, reconnecting: true }));
          reconnectTimeout.current = setTimeout(connect, 5000);
        }
      };

      ws.current.onerror = (event) => {
        if (event instanceof ErrorEvent) {
          handleError('ERROR', 'WebSocket connection error', event.error);
        } else {
          handleError('ERROR', 'Unknown WebSocket error', new Error('Unknown WebSocket error'));
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        handleError('CONNECT', 'Error connecting to WebSocket', error);
      }
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setState({ connected: false, reconnecting: false });
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [symbols]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    prices,
    data,
    error,
    connect,
    disconnect
  };
}
