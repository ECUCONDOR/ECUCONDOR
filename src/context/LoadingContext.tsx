import React, { createContext, useContext, useState, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage('');
  }, []);

  const setLoadingMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, setLoadingMessage }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center z-50">
          <LoadingSpinner size="large" color="white" />
          {message && (
            <p className="mt-4 text-white text-lg">{message}</p>
          )}
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
