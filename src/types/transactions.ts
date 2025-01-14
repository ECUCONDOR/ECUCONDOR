export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TransactionType = 
  | 'p2p'
  | 'international'
  | 'exchange';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  sourceCurrency: Currency;
  targetCurrency?: Currency;
  exchangeRate?: number;
  status: TransactionStatus;
  senderUserId: string;
  recipientUserId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface WalletBalance {
  currency: Currency;
  available: number;
  pending: number;
  reserved: number;
}

export interface TransactionFee {
  type: 'percentage' | 'fixed';
  amount: number;
  currency: Currency;
}

export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  timestamp: Date;
  provider: string;
}
