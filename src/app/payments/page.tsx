'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExchangeForm } from '@/components/payments/ExchangeForm';
import { ARSExchangeForm } from '@/components/payments/ARSExchangeForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { handleExchangeAction } from '../actions/exchange';
import { RecentActivity } from '@/components/payments/RecentActivity';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(1000); // Ejemplo de balance
  const [activeTab, setActiveTab] = useState('usd-to-ars');

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Internacionales con Ecucondor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">Realice transacciones entre Argentina y Ecuador con Ecucondor SAS BIC</p>
            <p className="text-sm text-gray-500 mt-2">Su socio confiable para transferencias internacionales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambio de Divisas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="usd-to-ars"
                  onClick={() => setActiveTab('usd-to-ars')}
                >
                  USD → ARS
                </TabsTrigger>
                <TabsTrigger 
                  value="ars-to-usd"
                  onClick={() => setActiveTab('ars-to-usd')}
                >
                  ARS → USD
                </TabsTrigger>
              </TabsList>

              <TabsContent value="usd-to-ars">
                <div className="space-y-4 pt-4">
                  <ExchangeForm action={handleExchangeAction} />
                </div>
              </TabsContent>

              <TabsContent value="ars-to-usd">
                <div className="space-y-4 pt-4">
                  <ARSExchangeForm action={handleExchangeAction} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <RecentActivity />
      </div>
    </div>
  );
}
