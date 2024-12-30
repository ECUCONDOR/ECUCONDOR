import { useEffect } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketPriceProps {
  symbol: string;
  className?: string;
}

export function MarketPrice({ symbol, className }: MarketPriceProps) {
  const { connected, reconnecting, data, error } = useMarketData(symbol);

  useEffect(() => {
    if (error) {
      console.error('Market data error:', error);
    }
  }, [error]);

  if (!connected || !data) {
    return (
      <Card className={cn('w-[350px]', className)}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-4 w-[100px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[200px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const priceChangeClass = data.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.price);

  const formattedVolume = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(data.volume);

  return (
    <Card className={cn('w-[350px]', className)}>
      <CardHeader>
        <CardTitle>{symbol}</CardTitle>
        <CardDescription>
          {reconnecting ? 'Reconnecting...' : 'Live Market Data'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Price:</span>
            <span className="text-lg font-bold">{formattedPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">24h Change:</span>
            <span className={cn('font-medium', priceChangeClass)}>
              {data.priceChangePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">24h Volume:</span>
            <span className="font-medium">{formattedVolume}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">24h High/Low:</span>
            <span className="font-medium">
              {data.high24h.toFixed(2)} / {data.low24h.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Last updated: {data.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
