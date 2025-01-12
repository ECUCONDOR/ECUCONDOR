'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useExchange } from '@/hooks/useExchange';
import { Currency, ExchangeFormData } from '@/lib/exchange';

interface ARSExchangeFormProps {
  action: (data: ExchangeFormData) => Promise<{ success: boolean; error: string | null }>;
}

export function ARSExchangeForm({ action }: ARSExchangeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exchangeRate, calculateExchange, isLoading } = useExchange();
  
  const [amount, setAmount] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [alias, setAlias] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !comprobante || !alias) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { sourceAmount, targetAmount } = calculateExchange(amount, 'ARS_TO_USD');
      
      const result = await action({
        amount: targetAmount,
        targetCurrency: 'USD' as Currency,
        comprobante,
        alias
      });

      if (!result.success) throw new Error(result.error || 'Error al procesar la transacción');

      toast({
        title: "Transacción enviada",
        description: "Su solicitud de cambio está siendo procesada",
      });

      // Limpiar formulario
      setAmount('');
      setComprobante('');
      setAlias('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al procesar su solicitud",
        variant: "destructive",
      });
    }
  };

  const { sourceAmount, targetAmount, appliedRate } = calculateExchange(amount || '0', 'ARS_TO_USD');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Monto en ARS</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Comprobante de Pago</Label>
          <Input
            type="text"
            value={comprobante}
            onChange={(e) => setComprobante(e.target.value)}
            placeholder="Número de comprobante"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Alias o Referencia</Label>
          <Input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Su alias o referencia"
            disabled={isLoading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Titular:</div>
              <div>Reina Mosquera</div>
              <div className="font-semibold">CVU:</div>
              <div>0000003100085925582280</div>
              <div className="font-semibold">Alias:</div>
              <div>reinasmb.</div>
              <div className="font-semibold">CUIT/CUIL:</div>
              <div>20963144769</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monto ARS:</span>
                <span>${sourceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa de cambio (ajustada):</span>
                <span>{appliedRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total en USD:</span>
                <span>${targetAmount.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                La tasa de cambio incluye un ajuste de $50 ARS para la compra de dólares
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          'Confirmar Cambio'
        )}
      </Button>
    </form>
  );
}
