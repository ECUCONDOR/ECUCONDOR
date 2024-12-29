import { z } from 'zod';
import { Currency, OrderType, PaymentMethod } from '@/types/p2p';
import { P2PServiceError, P2PErrorCodes } from './errors';

export const orderSchema = z.object({
  currency: z.nativeEnum(Currency as any, {
    required_error: 'La moneda es requerida',
    invalid_type_error: 'Moneda inválida'
  }),
  type: z.nativeEnum(OrderType as any, {
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
  payment_method: z.nativeEnum(PaymentMethod as any, {
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
      'Datos de orden inválidos',
      P2PErrorCodes.VALIDATION_ERROR,
      error
    );
  }
}
