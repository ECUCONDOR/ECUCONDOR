export type PaymentMethodType = 'BANCO' | 'PIX' | 'TARJETA';

interface BasePaymentDetails {
  monto: number;
  moneda: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO';
}

// Detalles específicos para pagos con tarjeta
export interface CardPaymentDetails extends BasePaymentDetails {
  tipo: 'TARJETA';
  detalles: {
    ultimos_digitos: string;
    marca: string;
    expiracion: string;
    titular: string;
  };
}

// Detalles específicos para pagos bancarios
export interface BankPaymentDetails extends BasePaymentDetails {
  tipo: 'BANCO';
  detalles: {
    banco: string;
    numero_cuenta: string;
    tipo_cuenta: string;
  };
}

// Detalles específicos para pagos PIX
export interface PixPaymentDetails extends BasePaymentDetails {
  tipo: 'PIX';
  detalles: {
    pix_key: string;
  };
}

export type PaymentDetails = CardPaymentDetails | BankPaymentDetails | PixPaymentDetails;
