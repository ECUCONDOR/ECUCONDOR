export const PAYMENT_CONFIG = {
  ROUTES: {
    SUCCESS: '/payments/success',
    ERROR: '/payments/error',
    CALLBACK: '/payments/callback'
  },
  SESSION: {
    REQUIRED: true,
    REDIRECT: '/auth/login'
  },
  ERROR_MESSAGES: {
    NO_SESSION: 'Sesión no válida o expirada',
    PAYMENT_FAILED: 'Error en el proceso de pago',
    INVALID_AMOUNT: 'El monto ingresado no es válido',
    INVALID_CURRENCY: 'La moneda seleccionada no es válida',
    TIMEOUT: 'La operación ha excedido el tiempo límite',
    SERVER_ERROR: 'Error en el servidor, por favor intente más tarde'
  },
  TIMEOUTS: {
    PAYMENT_PROCESS: 30000, // 30 segundos
    SESSION_CHECK: 5000,    // 5 segundos
    REDIRECT: 3000         // 3 segundos
  }
} as const;

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface PaymentResult {
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
  paymentDate?: string;
  amount?: number;
  currency?: string;
}

export interface PaymentPageProps {
  params: {
    id?: string;
  };
  searchParams: {
    amount?: string;
    currency?: string;
    description?: string;
  };
}
