import { ExchangeOption, ExchangePair, ExchangeRate } from '@/types/exchange';
import { DollarSign, CircleDollarSign, Bitcoin, Coins } from 'lucide-react';

export const exchangeOptions: ExchangeOption[] = [
  {
    id: 'USD-ARS',
    label: 'USD/ARS',
    name: 'Dólares a Pesos',
    symbol: 'USDTARS',
    baseSymbol: 'USD',
    quoteSymbol: 'ARS',
    pair: 'USD-ARS',
    currencySymbol: '$',
    icon: DollarSign
  },
  {
    id: 'BRL-ARS',
    label: 'BRL/ARS',
    name: 'Reales a Pesos',
    symbol: 'BRLARS',
    baseSymbol: 'BRL',
    quoteSymbol: 'ARS',
    pair: 'BRL-ARS',
    currencySymbol: 'R$',
    icon: CircleDollarSign
  },
  {
    id: 'ARS-BRL',
    label: 'ARS/BRL',
    name: 'Pesos a Reales',
    symbol: 'ARSBRL',
    baseSymbol: 'ARS',
    quoteSymbol: 'BRL',
    pair: 'ARS-BRL',
    currencySymbol: '$',
    icon: Coins
  },
  {
    id: 'BRL-USD',
    label: 'BRL/USD',
    name: 'Reales a Dólares',
    symbol: 'BRLUSD',
    baseSymbol: 'BRL',
    quoteSymbol: 'USD',
    pair: 'BRL-USD',
    currencySymbol: 'R$',
    icon: CircleDollarSign
  },
  {
    id: 'BTC-USD',
    label: 'BTC/USD',
    name: 'Bitcoin a Dólares',
    crypto: true,
    symbol: 'BTCUSDT',
    baseSymbol: 'BTC',
    quoteSymbol: 'USD',
    pair: 'BTC-USD',
    currencySymbol: '₿',
    icon: Bitcoin
  }
];

export const initialRates: Record<ExchangePair, ExchangeRate> = {
  'USD-ARS': { value: 0, lastUpdate: new Date(), change24h: 0 },
  'BRL-ARS': { value: 0, lastUpdate: new Date(), change24h: 0 },
  'ARS-BRL': { value: 0, lastUpdate: new Date(), change24h: 0 },
  'BRL-USD': { value: 0, lastUpdate: new Date(), change24h: 0 },
  'BTC-USD': { value: 0, lastUpdate: new Date(), change24h: 0 },
  'WLD-USD': { value: 0, lastUpdate: new Date(), change24h: 0 }
};
