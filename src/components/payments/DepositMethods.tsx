'use client'

import * as React from 'react'
import { PaymentForm } from '@/components/PaymentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Building2, 
  QrCode,
  type LucideIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type PaymentMethodType = 'bank' | 'pix' | 'card' | 'ARS-BRL';

interface PaymentMethodData {
  id: PaymentMethodType;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface DepositMethodsProps {
  onMethodSelect?: (method: PaymentMethodType) => void;
  selectedMethod?: PaymentMethodType | null;
  onBack?: () => void;
  className?: string;
}

const paymentMethods: PaymentMethodData[] = [
  {
    id: 'bank',
    title: 'Transferencia Bancaria',
    description: 'Transfiere desde tu cuenta bancaria',
    icon: Building2
  },
  {
    id: 'pix',
    title: 'PIX',
    description: 'Pago instantáneo brasileño',
    icon: QrCode
  },
  {
    id: 'card',
    title: 'Tarjeta de Crédito/Débito',
    description: 'Paga con tu tarjeta',
    icon: CreditCard
  }
];

export const DepositMethods: React.FC<DepositMethodsProps> = ({
  onMethodSelect,
  selectedMethod,
  onBack,
  className
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);

  const handleMethodSelect = React.useCallback(async (method: PaymentMethodType) => {
    try {
      setIsLoading(true);
      setError(null);

      onMethodSelect?.(method);
      setShowPaymentForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al seleccionar método de pago');
      console.error('Error en handleMethodSelect:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onMethodSelect]);

  const handleBack = React.useCallback(() => {
    setShowPaymentForm(false);
    onBack?.();
  }, [onBack]);

  const handlePaymentSuccess = React.useCallback(() => {
    console.log('Pago exitoso');
  }, []);

  const handlePaymentError = React.useCallback((errorMessage: string) => {
    setError(errorMessage);
    setShowPaymentForm(false);
  }, []);

  if (selectedMethod && showPaymentForm) {
    return (
      <PaymentForm
        method={selectedMethod as 'bank' | 'pix' | 'card'}
        onBack={handleBack}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {paymentMethods.map((method) => {
        const IconComponent = method.icon;
        
        return (
          <Card
            key={method.id}
            className="p-6 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{method.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default DepositMethods;