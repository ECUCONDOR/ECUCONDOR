import { PaymentMethodType } from '../types';

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  name: string;
  provider: string;
  type: string;
  iconName: string;
  disabled?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'bank',
    name: 'Transferencia Bancaria',
    provider: 'bank',
    type: 'transfer',
    iconName: 'Bank',
  },
  {
    id: 'pix',
    name: 'Pago con QR',
    provider: 'mercadopago',
    type: 'qr',
    iconName: 'QrCode',
  },
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    provider: 'mercadopago',
    type: 'card',
    iconName: 'CreditCard',
  }
];

export const getPaymentMethodById = (id: PaymentMethodType): PaymentMethodConfig | undefined =>
  PAYMENT_METHODS.find(method => method.id === id);

export const isPaymentMethodEnabled = (id: PaymentMethodType): boolean =>
  PAYMENT_METHODS.some(method => method.id === id && !method.disabled);
