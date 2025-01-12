'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Transaction = {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  from_wallet_id: string;
  to_wallet_id: string;
};

type RealtimePayload = {
  new: Transaction;
  old: Transaction;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

const getStatusMessage = (status: string, amount: number, from: string, to: string) => {
  const messages = {
    pendiente: {
      title: '¡Tu dinero está en camino! 🚀',
      description: `Estamos procesando tu cambio de ${amount} ${from} a ${to}. ¡Es como esperar un regalo especial! Te avisaremos cuando llegue.`
    },
    completado: {
      title: '¡Dinero entregado! 🎉',
      description: `¡Genial! Tu cambio de ${amount} ${from} a ${to} está listo. ¡Es como recibir un regalo! Ya puedes usar tu dinero.`
    },
    rechazado: {
      title: 'Ups, algo no salió bien 😢',
      description: `Hubo un problemita con tu cambio de ${amount} ${from} a ${to}. ¡No te preocupes! Podemos intentarlo de nuevo.`
    }
  };
  return messages[status as keyof typeof messages];
};

export function StatusNotification() {
  const { user } = useAuth();
  const [notification, setNotification] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('transaction-updates')
      .on<Database['public']['Tables']['transacciones']['Row']>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transacciones',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePayload) => {
          const transaction = payload.new as Transaction;
          setNotification(transaction);
          
          // Limpiar la notificación después de 10 segundos
          setTimeout(() => {
            setNotification(null);
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!notification) return null;

  const statusIcons = {
    pendiente: <Clock className="h-6 w-6 text-yellow-500" />,
    completado: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    rechazado: <XCircle className="h-6 w-6 text-red-500" />
  };

  const message = getStatusMessage(
    notification.status,
    notification.amount,
    notification.from_wallet_id,
    notification.to_wallet_id
  );

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            className={`
              ${notification.status === 'pendiente' && 'bg-yellow-50 border-yellow-200'}
              ${notification.status === 'completado' && 'bg-green-50 border-green-200'}
              ${notification.status === 'rechazado' && 'bg-red-50 border-red-200'}
              shadow-lg
            `}
          >
            {statusIcons[notification.status as keyof typeof statusIcons]}
            <div className="ml-3">
              <AlertTitle className="font-medium mb-1">
                {message.title}
              </AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                {message.description}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotification(null)}
                className="mt-2 text-xs"
              >
                Entendido
              </Button>
            </div>
          </Alert>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
