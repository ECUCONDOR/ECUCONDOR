'use client';

import React from 'react';
import { DollarSign, Bitcoin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencyIconProps {
  currency: string;
  className?: string;
  size?: number;
}

const CurrencyIcon: React.FC<CurrencyIconProps> = ({ 
  currency, 
  className,
  size = 24 
}) => {
  const Icon = React.useMemo(() => {
    switch (currency.toUpperCase()) {
      case 'BTC':
        return Bitcoin;
      case 'WLD':
        return Globe;
      default:
        return DollarSign;
    }
  }, [currency]);

  return (
    <Icon 
      className={cn("text-foreground", className)} 
      size={size}
      aria-label={`${currency} icon`}
    />
  );
};

export default CurrencyIcon;
