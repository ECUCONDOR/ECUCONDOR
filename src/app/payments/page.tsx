'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(1000); // Ejemplo de balance
  const [activeTab, setActiveTab] = useState('send');

  const handlePayment = async (amount: number, recipient: string) => {
    // Aquí iría la lógica de pago real
    console.log(`Sending ${amount} to ${recipient}`);
    setBalance(prev => prev - amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Billetera Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)} USD</div>
            <p className="text-sm text-gray-500">Balance Disponible</p>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="send"
                  onClick={() => setActiveTab('send')}
                >
                  Enviar
                </TabsTrigger>
                <TabsTrigger 
                  value="receive"
                  onClick={() => setActiveTab('receive')}
                >
                  Recibir
                </TabsTrigger>
              </TabsList>

              <TabsContent value="send">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Destinatario</Label>
                    <Input type="text" placeholder="Email o ID del destinatario" />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <Button className="w-full">Enviar Pago</Button>
                </div>
              </TabsContent>

              <TabsContent value="receive">
                <div className="space-y-4 pt-4">
                  <Alert>
                    <AlertDescription>
                      Tu ID de billetera: {user?.id}
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-gray-500">
                    Comparte este ID con otros usuarios para recibir pagos.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => navigator.clipboard.writeText(user?.id || '')}
                  >
                    Copiar ID
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pago Enviado</p>
                  <p className="text-sm text-gray-500">A: usuario123</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-500">-$50.00</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pago Recibido</p>
                  <p className="text-sm text-gray-500">De: usuario456</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-500">+$75.00</p>
                  <p className="text-sm text-gray-500">Hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
