import { LucideIcon } from 'lucide-react';

export type PaymentMethodType = 'bank' | 'pix' | 'card';

export interface PaymentMethodData {
  id: PaymentMethodType;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PaymentFormProps {
  method: PaymentMethodType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

export interface DepositMethodsProps {
  onMethodSelect?: (method: PaymentMethodType | null) => void;
  selectedMethod?: PaymentMethodType | null;
  onBack?: () => void;
  className?: string;
}
