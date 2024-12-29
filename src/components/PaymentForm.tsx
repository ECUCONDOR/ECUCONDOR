'use client'

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generatePaymentId } from '@/services/payment.service';

interface PaymentFormProps {
  method: 'bank' | 'pix' | 'card';
  onError?: (error: string) => void;
  onSuccess?: () => void;
  onBack?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  method,
  onError,
  onSuccess,
  onBack
}) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Por favor, ingrese un monto válido');
      }

      // Generar ID de pago
      const newPaymentId = generatePaymentId();
      setPaymentId(newPaymentId);

      // Simulación de proceso de pago
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = () => {
    switch (method) {
      case 'pix':
        return paymentId ? (
          <div className="flex flex-col items-center space-y-4">
            <QRCode value={paymentId} size={256} />
            <p className="text-sm text-muted-foreground">
              Escanee el código QR para realizar el pago
            </p>
          </div>
        ) : null;

      case 'bank':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Datos Bancarios</h3>
              <p className="text-sm">Banco: Banco Pichincha</p>
              <p className="text-sm">Cuenta: 123456789</p>
              <p className="text-sm">Tipo: Corriente</p>
              {paymentId && (
                <p className="text-sm mt-2">
                  ID de Transferencia: {paymentId}
                </p>
              )}
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Fecha de Expiración</Label>
                <Input id="expiry" placeholder="MM/YY" maxLength={5} />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" maxLength={4} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Monto a Depositar</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>

        {renderPaymentMethod()}

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            Volver
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Continuar'}
          </Button>
        </div>
      </div>
    </form>
  );
};
