// Base Client Types
export interface ClientData {
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  phone?: string;
  type?: 'personal' | 'business';
}

export interface Client extends ClientData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Dashboard Types
export interface DashboardData {
  saldoActual: number;
  transferencias_pendientes: number;
  ultimosMovimientos: Movement[];
}

export interface Movement {
  id: string;
  amount: number;
  type: string;
  date: string;
}

// Bank Account Types
export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  documentType: string;
  holderDocument: string;
  accountName: string;
  ruc: string;
  email: string;
}

// Registration Types
export interface RegistrationContext {
  user: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    type?: 'personal' | 'business';
  };
  verificationStatus: 'pending' | 'verified' | 'rejected' | null;
  error: string | null;
}

// Component Props Types
export interface DocumentVerificationStepProps {
  userId: string;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export interface TransferCalculatorProps {
  onTransfer: (transferDetails: {
    amount: number;
    fromWalletId: string;
    toWalletId: string;
    description: string;
  }) => Promise<void>;
  clientId: number;
}

// API Response Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse {
  message?: string;
  code?: string;
  error?: string;
  client?: Client;
  clients?: Client[];
  clientId?: string;
  validationErrors?: ValidationError[];
}
