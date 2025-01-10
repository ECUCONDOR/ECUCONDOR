'use client';

import React from 'react';
import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Wallet, CreditCard, ArrowUpDown, Clock, Menu, Bell, Search, 
  Settings, ArrowUpRight, ArrowDownRight, DollarSign, Filter,
  Send, PiggyBank, History, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useDashboardContext } from '@/contexts/dashboard-context';
import { useClientData, formatCurrency } from '@/hooks/useClientData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TransferForm } from '@/components/payments/TransferForm';
import { DashboardChart } from '@/components/DashboardChart';
import { toast } from '@/components/ui/use-toast';

const mockData = {
  balanceHistory: [
    { month: 'Ene', value: 5000 },
    { month: 'Feb', value: 7500 },
    { month: 'Mar', value: 6800 },
    { month: 'Abr', value: 8900 }
  ]
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold">{value}</h3>
            </div>
          </div>
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const QuickActionCard = ({ title, description, href, icon: Icon, onClick }: QuickActionCardProps) => {
  const content = (
    <Card className="h-full hover:bg-accent transition-colors">
      <div className="p-6">
        <div className="flex flex-col items-start space-y-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <a href={href} className="block w-full">
      {content}
    </a>
  );
};

const calculateChange = (defaultValue: number, value?: number) => {
  if (value === undefined) {
    return defaultValue.toFixed(1) + '%';
  }
  return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
};

export default function Dashboard() {
  const [showTransferDialog, setShowTransferDialog] = React.useState(false);
  const { clientId, loading: contextLoading } = useDashboardContext();
  const { data, loading: dataLoading, error } = useClientData(clientId);

  const handleTransfer = async (transferDetails: { 
    amount: number; 
    fromWalletId: string; 
    toWalletId: string; 
    description: string; 
  }) => {
    try {
      // Aquí iría la lógica de la transferencia
      toast({
        title: "Transferencia exitosa",
        description: `Se ha transferido ${formatCurrency(transferDetails.amount)} correctamente.`,
      });
    } catch (error) {
      console.error('Error en la transferencia:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la transferencia",
        variant: "destructive",
      });
    }
  };

  if (contextLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(data?.balance)}
          change={calculateChange(0, data?.balance_change)}
          icon={Wallet}
          trend={data?.balance_change >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Transacciones"
          value={data?.transactions_24h?.toString() ?? '0'}
          change={`${data?.transactions_24h > 0 ? '+' : ''}${data?.transactions_24h ?? 0}`}
          icon={ArrowUpDown}
          trend={data?.transactions_24h > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Tarjetas Activas"
          value={data?.active_cards?.toString() ?? '0'}
          change={`${data?.active_cards > 0 ? '+' : ''}${data?.active_cards ?? 0}`}
          icon={CreditCard}
          trend={data?.active_cards > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Última Actividad"
          value={data?.last_activity?.split(':')[0] ?? 'N/A'}
          change="activo"
          icon={Clock}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Historial de Balance</h3>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
            <div className="h-[300px]">
              <DashboardChart data={mockData.balanceHistory} />
            </div>
          </div>
        </Card>

        <Card className="col-span-3">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Transferencia</DialogTitle>
                    <DialogDescription>
                      Completa los datos para realizar una transferencia
                    </DialogDescription>
                  </DialogHeader>
                  <TransferForm 
                    clientId={clientId!}
                    onTransferAction={handleTransfer}
                  />
                </DialogContent>
              </Dialog>
              <QuickActionCard
                title="Ahorros"
                description="Gestiona tus metas de ahorro"
                href="/savings"
                icon={PiggyBank}
              />
              <QuickActionCard
                title="Historial"
                description="Ve tus movimientos recientes"
                href="/history"
                icon={History}
              />
              <QuickActionCard
                title="Seguridad"
                description="Configura tus opciones de seguridad"
                href="/security"
                icon={ShieldCheck}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}