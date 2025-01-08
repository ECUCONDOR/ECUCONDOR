'use client';

import { createContext, useContext, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const showLoading = (msg?: string) => {
    setIsLoading(true);
    if (msg) setMessage(msg);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setMessage('');
  };

  const setLoadingMessage = (msg: string) => {
    setMessage(msg);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, setLoadingMessage }}>
      {children}
      {isLoading && (
        <Spinner 
          fullScreen 
          size="xl"
          className="text-primary"
        />
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
