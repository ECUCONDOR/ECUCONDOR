'use client';

import React, { memo } from 'react';
import { TrendingUp } from 'lucide-react';
import { ExchangeRate } from '@/types/exchange';

interface TrendIndicatorProps {
  rate?: ExchangeRate;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ rate, className = '' }) => {
  if (!rate?.change24h) return null;

  const isUp = rate.change24h >= 0;
  const colorClass = isUp ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className={`flex items-center gap-1 text-sm ${colorClass} ${className}`}>
      <TrendingUp 
        className={`h-4 w-4 ${isUp ? '' : 'transform rotate-180'}`} 
        aria-label={isUp ? 'Trending up' : 'Trending down'}
      />
      <span>{Math.abs(rate.change24h).toFixed(2)}%</span>
    </div>
  );
};

export default memo(TrendIndicator);
