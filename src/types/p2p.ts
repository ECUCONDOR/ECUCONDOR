export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
export type Currency = 'USD' | 'ARS' | 'BRL' | 'WLD';
export type PaymentMethod = 'TRANSFERENCIA_BANCARIA' | 'MERCADOPAGO' | 'PAYPAL';

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
  type: OrderType;
  currency: Currency;
  amount: number;
  price: number;
  status: OrderStatus;
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
  type: OrderType;
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
  status?: OrderStatus;
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
