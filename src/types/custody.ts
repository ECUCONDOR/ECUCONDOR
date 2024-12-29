export type CurrencyType = 'ARS' | 'USD';

export interface CustodyAccount {
  id: string;
  type: CurrencyType;
  bank: string;
  accountNumber: string;
  cbu: string;
  alias: string;
  owner: string;
  ownerDocument: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  recentOperations: CustodyOperation[];
  dailyLimit: number;
  monthlyLimit: number;
}

export interface CustodyOperation {
  id: string;
  type: 'BUY' | 'SELL';
  sourceCurrency: CurrencyType;
  targetCurrency: CurrencyType;
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: ExchangeRate;
  sourceAccountId: string;
  targetAccountId: string;
  status: 'PENDING' | 'FUNDS_RECEIVED' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  steps: OperationStep[];
}

export interface ExchangeRate {
  buy: number;
  sell: number;
  date: Date;
}

export interface OperationStep {
  step: 'START' | 'FUNDS_RECEPTION' | 'COMPANY_TRANSFER';
  date: Date;
  status: 'COMPLETED' | 'ERROR';
  details: string;
  receipt?: string;
}

export interface DailyReport {
  date: Date;
  totalOperations: number;
  volumeARS: number;
  volumeUSD: number;
  completedOperations: number;
  pendingOperations: number;
}
