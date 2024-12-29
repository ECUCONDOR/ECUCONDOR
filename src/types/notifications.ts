export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'exchange';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface ExchangeNotification extends Notification {
  type: 'exchange';
  data: {
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId: string;
  };
}
