export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'exchange';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: unknown;
}

export interface ExchangeNotification extends BaseNotification {
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

export interface SystemNotification extends BaseNotification {
  type: 'success' | 'error' | 'warning' | 'info';
}

export type Notification = SystemNotification | ExchangeNotification;
