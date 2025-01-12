export type TransactionStatus = 
  | 'PENDING_UPLOAD' // Esperando que el cliente suba el comprobante
  | 'PENDING_VERIFICATION' // Comprobante subido, esperando verificación
  | 'IN_ANALYSIS' // En análisis por el equipo
  | 'VERIFIED' // Comprobante verificado
  | 'COMPLETED' // Transacción completada
  | 'REJECTED' // Transacción rechazada
  | 'CANCELLED'; // Transacción cancelada

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency_from: string;
  currency_to: string;
  exchange_rate: number;
  converted_amount: number;
  status: TransactionStatus;
  proof_of_payment_url?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

export interface TransactionUpdate {
  status?: TransactionStatus;
  proof_of_payment_url?: string;
  notes?: string;
  completed_at?: string;
}
