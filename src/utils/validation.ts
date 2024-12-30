import { z } from 'zod';
import { CurrencyCode, OrderTypeEnum, PaymentMethodType } from '@/types/p2p';
import { P2PServiceError } from './errors';

enum P2PErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export const orderSchema = z.object({
  currency: z.nativeEnum(CurrencyCode, {
    required_error: 'La moneda es requerida',
    invalid_type_error: 'Moneda inválida'
  }),
  type: z.nativeEnum(OrderTypeEnum, {
    required_error: 'El tipo de orden es requerido',
    invalid_type_error: 'Tipo de orden inválido'
  }),
  amount: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'El monto debe ser un número'
  }).positive('El monto debe ser mayor a 0'),
  price: z.number({
    required_error: 'El precio es requerido',
    invalid_type_error: 'El precio debe ser un número'
  }).positive('El precio debe ser mayor a 0'),
  payment_method: z.nativeEnum(PaymentMethodType, {
    required_error: 'El método de pago es requerido',
    invalid_type_error: 'Método de pago inválido'
  }),
  bank_info: z.string().optional(),
  country: z.string().optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional()
});

export function validateOrder(data: unknown) {
  try {
    return orderSchema.parse(data);
  } catch (error) {
    throw new P2PServiceError(
      P2PErrorCodes.INTERNAL_ERROR,
      'Datos de orden inválidos'
    );
  }
}

export function validateAmount(amount: number, min: number, max: number): boolean {
  try {
    if (amount < min || amount > max) {
      throw new Error(`El monto debe estar entre ${min} y ${max}`);
    }
    return true;
  } catch (error) {
    throw new P2PServiceError(P2PErrorCodes.INVALID_AMOUNT, error instanceof Error ? error.message : 'Invalid amount');
  }
}

export function handleValidationError(error: unknown, message?: string): never {
  if (error instanceof Error) {
    throw new P2PServiceError(P2PErrorCodes.INVALID_AMOUNT, message || error.message);
  }
  throw error;
}
