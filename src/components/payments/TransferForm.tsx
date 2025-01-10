'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDashboardContext } from '@/contexts/dashboard-context';
import { Card } from '@/components/ui/card';
import TransferCalculator from './TransferCalculator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

interface TransferFormProps {
  clientId: number;
  onTransferAction: (transferDetails: { 
    amount: number; 
    fromWalletId: string; 
    toWalletId: string; 
    description: string; 
  }) => Promise<void>;
}

export function TransferForm({ clientId, onTransferAction }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async (transferDetails: {
    amount: number;
    fromWalletId: string;
    toWalletId: string;
    description: string;
  }) => {
    try {
      setIsSubmitting(true);

      const { data, error } = await supabase.functions.invoke('create-transfer', {
        body: {
          amount: transferDetails.amount,
          from_wallet_id: transferDetails.fromWalletId,
          to_wallet_id: transferDetails.toWalletId,
          description: transferDetails.description,
        },
      });

      if (error) throw error;

      toast({
        title: 'Transferencia exitosa',
        description: 'La transferencia se ha realizado correctamente.',
      });

      await onTransferAction(transferDetails);
    } catch (error) {
      console.error('Error en la transferencia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la transferencia. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clientId) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No se encontró información del cliente.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {isSubmitting ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Procesando transferencia...</span>
        </div>
      ) : (
        <TransferCalculator onTransferAction={handleTransfer} clientId={clientId} />
      )}
    </Card>
  );
}
