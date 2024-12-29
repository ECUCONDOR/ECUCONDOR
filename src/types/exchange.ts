import { LucideIcon } from 'lucide-react';

// Tipos de monedas y pares
export type CurrencyCode = 'USD' | 'ARS' | 'BRL' | 'BTC' | 'WLD';
export type ExchangePair = 'USD-ARS' | 'BRL-ARS' | 'ARS-BRL' | 'BRL-USD' | 'BTC-USD' | 'WLD-USD';
export type BinancePair = 'BTCUSDT' | 'WLDUSDT' | 'USDTBRL' | 'USDTARS';

export interface ExchangeRate {
  value: number;
  lastUpdate: Date;
  change24h: number;
}

export interface ExchangeRates {
  [key: string]: ExchangeRate;
}

export type RateHistory = Record<ExchangePair, RateHistoryItem[]>;

export interface RateHistoryItem {
  time: string;
  value: number;
}

export interface ExchangeOption {
  id: ExchangePair;
  label: string;
  name: string;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  pair: string;
  crypto?: boolean;
  currencySymbol?: string;
  icon: LucideIcon;
}
