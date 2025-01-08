'use client';

import React, { useState } from 'react';
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
  AreaChart, Area, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Wallet, CreditCard, ArrowUpDown, Clock, Menu, Bell, Search, 
  Settings, ArrowUpRight, ArrowDownRight, DollarSign, Filter,
  Send, PiggyBank, History, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useDashboardContext } from '@/contexts/dashboard-context';
import { useClientData, formatCurrency } from '@/hooks/useClientData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TransferForm } from '@/components/payments/TransferForm';

const mockData = {
  balanceHistory: [
    { month: 'Ene', balance: 5000 },
    { month: 'Feb', balance: 7500 },
    { month: 'Mar', balance: 6800 },
    { month: 'Abr', balance: 8900 }
  ]
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
        {trend === 'up' ? (
          <ArrowUpRight className="h-4 w-4 text-green-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-400" />
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          <p className={`ml-2 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 group">
      <a href={href} className="block p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10">
            {icon}
          </div>
          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="font-medium text-gray-200 group-hover:text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {description}
        </p>
      </a>
    </Card>
  );
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const { clientId, loading: contextLoading } = useDashboardContext();
  const { data, loading: dataLoading, error } = useClientData(clientId);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-black">
      {/* Top Navigation */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="ml-4 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
                Mi Billetera
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar transacción..."
                  className="pl-10 bg-white/5 border-white/10 w-64"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Saldo Total"
            value={data ? formatCurrency(data.balance) : '$0,00'}
            change={data?.balance_change ? `${data.balance_change > 0 ? '+' : ''}${data.balance_change.toFixed(1)}%` : '0%'}
            icon={<Wallet className="h-5 w-5 text-blue-400" />}
            trend={data?.balance_change ? data.balance_change >= 0 ? 'up' : 'down' : 'up'}
          />
          <StatCard
            title="Transacciones"
            value={(data?.transactions_24h ?? 0).toString()}
            change={`${(data?.transactions_24h ?? 0) > 0 ? '+' : ''}${data?.transactions_24h ?? 0}`}
            icon={<ArrowUpDown className="h-5 w-5 text-cyan-400" />}
            trend={(data?.transactions_24h ?? 0) > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Tarjetas Activas"
            value={(data?.active_cards ?? 0).toString()}
            change={`${(data?.active_cards ?? 0) > 0 ? '+' : ''}${data?.active_cards ?? 0}`}
            icon={<CreditCard className="h-5 w-5 text-blue-400" />}
            trend={(data?.active_cards ?? 0) > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Última Actividad"
            value={data?.last_activity?.split(':')[0] || 'N/A'}
            change="activo"
            icon={<Clock className="h-5 w-5 text-cyan-400" />}
            trend="up"
          />
        </div>

        {/* Chart Section */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Historial de Balance</h3>
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData.balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#60A5FA"
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <div>
                <QuickActionCard
                  title="Enviar Dinero"
                  description="Transferencias rápidas"
                  href="#"
                  icon={<Send className="h-6 w-6" />}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Realizar Transferencia</DialogTitle>
                <DialogDescription>
                  Transfiere dinero a otra billetera de forma segura.
                </DialogDescription>
              </DialogHeader>
              <TransferForm />
            </DialogContent>
          </Dialog>

          <QuickActionCard
            title="Ahorros"
            description="Gestiona tus metas"
            href="/savings"
            icon={<PiggyBank className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Historial"
            description="Ver movimientos"
            href="/history"
            icon={<History className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Seguridad"
            description="Configura tu cuenta"
            href="/security"
            icon={<ShieldCheck className="h-6 w-6" />}
          />
        </div>
      </main>
    </div>
  );
}