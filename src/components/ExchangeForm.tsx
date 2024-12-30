'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from './ui/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';

interface ExchangeFormProps {
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

export function ExchangeForm({ rate, fromCurrency, toCurrency }: ExchangeFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const calculateExchangeAmount = (inputAmount: number) => {
    return inputAmount * rate;
  };

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const numericAmount = parseFloat(amount);
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
          title: 'Error',
          description: 'Por favor ingrese un monto válido',
          variant: 'destructive',
        });
        return;
      }

      const exchangeAmount = calculateExchangeAmount(numericAmount);
      const transactionId = uuidv4();

      // Crear la transacción en la base de datos
      const { data: transaction, error: transactionError } = await supabase
        .from('exchange_transactions')
        .insert([
          {
            id: transactionId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            from_amount: numericAmount,
            from_currency: fromCurrency,
            to_amount: exchangeAmount,
            to_currency: toCurrency,
            rate: rate,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Notificar al usuario
      addNotification(
        'success',
        'Solicitud de cambio registrada',
        `Tu solicitud de cambio de ${numericAmount} ${fromCurrency} a ${exchangeAmount.toFixed(2)} ${toCurrency} ha sido registrada.`,
        {
          fromAmount: numericAmount,
          fromCurrency,
          toAmount: exchangeAmount,
          toCurrency,
          status: 'pending',
          transactionId
        }
      );

      // Mostrar toast de éxito
      toast({
        title: 'Solicitud enviada',
        description: 'Tu solicitud de cambio ha sido registrada correctamente.',
      });

      // Limpiar el formulario
      setAmount('');

    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      addNotification('error', 'Error al procesar la solicitud', 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleExchange} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
          Monto en {fromCurrency}
        </label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
            placeholder="0.00"
            disabled={isLoading}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
        </div>
      </div>

      {amount && !isNaN(parseFloat(amount)) && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Recibirás</span>
            <span className="font-medium">
              {(parseFloat(amount) * rate).toFixed(2)} {toCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Tasa de cambio</span>
            <span className="text-sm">
              1 {fromCurrency} = {rate.toFixed(2)} {toCurrency}
            </span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!amount || isLoading}
      >
        {isLoading ? 'Procesando...' : 'Iniciar intercambio'}
      </Button>
    </form>
  );
}
