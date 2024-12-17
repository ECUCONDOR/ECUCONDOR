'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Price } from '../types';
import { fetchApi } from '../utils/api';

interface PriceContextType {
  price: number;
  loading: boolean;
  error: string | null;
  updatePrice: (newPrice: number) => void;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialPrice() {
      try {
        const response = await fetchApi<Price>('prices/latest');
        if (response.status === 'success' && response.data) {
          setPrice(response.data.amount);
        } else {
          setError(response.error || 'Failed to load price');
        }
      } catch (err) {
        setError('Failed to load initial price');
      } finally {
        setLoading(false);
      }
    }

    loadInitialPrice();
  }, []);

  const updatePrice = (newPrice: number) => {
    setPrice(newPrice);
  };

  return (
    <PriceContext.Provider value={{ price, loading, error, updatePrice }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
}
