export type PaymentType = 'PIX' | 'QR' | 'CARD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
export type PaymentProvider = 'MERCADOPAGO' | 'MODO' | 'PIX' | 'STRIPE';
export type QRCodeStatus = 'ACTIVE' | 'EXPIRED' | 'USED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
export type WebhookStatus = 'PENDING' | 'PROCESSED' | 'FAILED';
export type FraudAction = 'BLOCKED' | 'FLAGGED' | 'ALLOWED';

export interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
}

export interface Payment {
  id: string;
  type: PaymentType;
  amount: number;
  description: string;
  userId: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  cardDetails?: CardDetails;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  payment_method_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider_transaction_id?: string;
  provider_status?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  payment_transaction_id: string;
  provider: PaymentProvider;
  qr_data: string;
  expiration_time: string;
  status: QRCodeStatus;
  created_at: string;
  updated_at: string;
}

export interface PaymentWebhook {
  id: string;
  provider: PaymentProvider;
  event_type: string;
  payload: Record<string, any>;
  status: WebhookStatus;
  processed_at?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  paymentId: string;
  reason: string;
  userId: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDispute {
  id: string;
  payment_transaction_id: string;
  status: DisputeStatus;
  reason: string;
  resolution?: string;
  resolution_details?: string;
  created_at: string;
  updated_at: string;
}

export interface FraudAttempt {
  id: string;
  payment_transaction_id: string;
  risk_score: number;
  risk_factors: Record<string, any>;
  action_taken: FraudAction;
  created_at: string;
}

export interface PaymentMethodConfig {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto';
}

export type PaymentMethod = PaymentMethodConfig;
