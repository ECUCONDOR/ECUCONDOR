// Basic type enums
export enum OrderTypeEnum {
  Buy = 'buy',
  Sell = 'sell'
}

export enum OrderStatusEnum {
  Open = 'open',
  Matched = 'matched',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum CurrencyCode {
  USD = 'USD',
  ARS = 'ARS',
  BRL = 'BRL',
  WLD = 'WLD'
}

export enum PaymentMethodType {
  TransferenciaBancaria = 'TRANSFERENCIA_BANCARIA',
  MercadoPago = 'MERCADOPAGO',
  PayPal = 'PAYPAL'
}

// Detailed type interfaces
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface OrderType {
  id: string;
  type: OrderTypeEnum;
  amount: number;
  price: number;
  currency: Currency;
  status: OrderStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLimits {
  id: string;
  user_id: string;
  verified: boolean;
  max_order_amount: number;
  daily_limit: number;
  monthly_limit: number;
  created_at: Date;
  updated_at: Date;
}

export interface P2POrder {
  id: string;
  type: OrderTypeEnum;
  currency: Currency;
  amount: number;
  price: number;
  status: OrderStatusEnum;
  user_id: string;
  payment_method: PaymentMethod;
  bank_info?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  matched_with?: string; // ID del usuario con el que se emparejó
  matched_at?: Date; // Fecha de emparejamiento
  completed_at?: Date; // Fecha de completado
  cancelled_at?: Date; // Fecha de cancelación
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  completed_trades: number;
  success_rate: number;
  orders?: P2POrder[];
  country?: string;
  bank_accounts: string[];
  payment_methods: PaymentMethod[];
  kyc_verified: boolean;
  reputation_score?: number; // Puntuación de reputación
  total_volume?: number; // Volumen total operado
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderDTO {
  type: OrderTypeEnum;
  currency: Currency;
  amount: number;
  price: number;
  payment_method: PaymentMethod;
  bank_info?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface UpdateOrderDTO {
  status?: OrderStatusEnum;
  price?: number;
  amount?: number;
  payment_method?: PaymentMethod;
  bank_info?: string;
  min_amount?: number;
  max_amount?: number;
  matched_with?: string;
  matched_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
}
