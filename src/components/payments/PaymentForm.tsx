'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentFormProps } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { PaymentService } from '@/services/payment.service';

interface FormState {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  amount: string;
}

export function PaymentForm({ method, onSuccess, onError, onBack }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    amount: ''
  });

  // Formateadores de entrada
  const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiry = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const formatCVV = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const formatAmount = (value: string): string => {
    const numbers = value.replace(/[^\d.]/g, '');
    const parts = numbers.split('.');
    if (parts.length > 2) return value;
    if (parts[1]?.length > 2) return value;
    return numbers;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        break;
      case 'cvv':
        formattedValue = formatCVV(value);
        break;
      case 'amount':
        formattedValue = formatAmount(value);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.cardNumber || !formData.expiry || !formData.cvv || !formData.name || !formData.amount) {
        throw new Error('Todos los campos son obligatorios');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Monto inválido');
      }

      const result = await PaymentService.procesarPagoTarjeta({
        numeroTarjeta: formData.cardNumber.replace(/\s/g, ''),
        expiracion: formData.expiry,
        cvv: formData.cvv,
        titular: formData.name,
        monto: amount
      });

      onSuccess?.();
      router.push(`/payments/success?id=${result.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (method === 'card') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label>Número de Tarjeta</Label>
          <Input
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            disabled={loading}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha de Expiración</Label>
            <Input
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength={5}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label>CVV</Label>
            <Input
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              placeholder="123"
              maxLength={4}
              type="password"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <Label>Nombre del Titular</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Como aparece en la tarjeta"
            disabled={loading}
            required
          />
        </div>

        <div>
          <Label>Monto (USD)</Label>
          <Input
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            disabled={loading}
            required
          />
        </div>

        <div className="flex space-x-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Volver
            </Button>
          )}

          <Button 
            type="submit" 
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Pagar'}
          </Button>
        </div>
      </form>
    );
  }

  return null; // Para otros métodos de pago
}
