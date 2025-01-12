'use client';

import React from 'react';
import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, CreditCard, ArrowUpDown, Menu, Bell, 
  Settings, ArrowUpRight, ArrowDownRight,
  Send, History, DollarSign, AlertTriangle, Filter
} from 'lucide-react';
import { usePanelControl } from '@/contexts/dashboard-context';
import { useClientData, formatCurrency } from '@/hooks/useClientData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string;
  cambio: string;
  icono: LucideIcon;
  tendencia: 'arriba' | 'abajo';
}

const TarjetaEstadistica = ({ titulo, valor, cambio, icono: Icono, tendencia }: TarjetaEstadisticaProps) => {
  return (
    <Card className={`p-6 ${
      titulo === 'Saldo Total' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
      titulo === 'Transacciones' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
      titulo === 'Tarjetas Activas' ? 'bg-gradient-to-br from-green-500 to-green-600' :
      'bg-gradient-to-br from-orange-500 to-orange-600'
    } text-white`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white/10 rounded-full">
            <Icono className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">{titulo}</p>
            <h3 className="text-2xl font-bold">{valor}</h3>
          </div>
        </div>
        <div className={`flex items-center ${tendencia === 'arriba' ? 'text-green-300' : 'text-red-300'}`}>
          {tendencia === 'arriba' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span className="text-sm font-medium">{cambio}</span>
        </div>
      </div>
    </Card>
  );
};

interface TarjetaAccionRapidaProps {
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: LucideIcon;
  onClick?: () => void;
}

const TarjetaAccionRapida = ({ titulo, descripcion, ruta, icono: Icono, onClick }: TarjetaAccionRapidaProps) => {
  const contenido = (
    <Card className="h-full hover:bg-accent/10 transition-colors bg-[#1a1f2e] text-white">
      <div className="p-6">
        <div className="flex flex-col items-start space-y-2">
          <div className="p-2 bg-white/10 rounded-full">
            <Icono className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">{titulo}</h3>
          <p className="text-sm text-gray-400">{descripcion}</p>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <button className="w-full text-left" onClick={onClick}>
        {contenido}
      </button>
    );
  }

  return (
    <a href={ruta} className="block w-full">
      {contenido}
    </a>
  );
};

const calcularCambio = (valorPredeterminado: number, valor?: number) => {
  if (valor === undefined) {
    return valorPredeterminado.toFixed(1) + '%';
  }
  return (valor > 0 ? '+' : '') + valor.toFixed(1) + '%';
};

export default function PanelControl() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { clienteId, cargando: cargandoContexto } = usePanelControl();
  const { data: datos, loading: cargandoDatos, error } = useClientData(clienteId);

  const cerrarSesion = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  if (cargandoContexto || cargandoDatos) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1421]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
    <div className="flex flex-col min-h-screen bg-[#0f1421] text-white">
      <header className="border-b border-gray-800">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Menu className="h-6 w-6" />
            <h1 className="text-xl font-bold">Panel de Control</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="destructive" 
              onClick={cerrarSesion}
              className="bg-red-600 hover:bg-red-700"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TarjetaEstadistica
            titulo="Saldo Total"
            valor={formatCurrency(datos?.balance ?? 0)}
            cambio={calcularCambio(0, datos?.balance_change)}
            icono={Wallet}
            tendencia={datos?.balance_change >= 0 ? 'arriba' : 'abajo'}
          />
          <TarjetaEstadistica
            titulo="Transacciones"
            valor={datos?.transactions_24h?.toString() ?? '0'}
            cambio={`${datos?.transactions_24h > 0 ? '+' : ''}${datos?.transactions_24h ?? 0}`}
            icono={ArrowUpDown}
            tendencia={datos?.transactions_24h > 0 ? 'arriba' : 'abajo'}
          />
          <TarjetaEstadistica
            titulo="Tarjetas Activas"
            valor={datos?.active_cards?.toString() ?? '0'}
            cambio={`${datos?.active_cards > 0 ? '+' : ''}${datos?.active_cards ?? 0}`}
            icono={CreditCard}
            tendencia={datos?.active_cards > 0 ? 'arriba' : 'abajo'}
          />
          <TarjetaEstadistica
            titulo="Última Actividad"
            valor={datos?.last_activity?.split(':')[0] ?? 'N/A'}
            cambio="activo"
            icono={ArrowUpDown}
            tendencia="arriba"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 bg-[#1a1f2e] border-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Historial de Balance</h3>
                <Button variant="outline" size="sm" className="text-gray-400 border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
              <div className="h-[300px]">
                {/* Aquí iría el componente del gráfico */}
              </div>
            </div>
          </Card>

          <Card className="col-span-3 bg-[#1a1f2e] border-gray-800">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TarjetaAccionRapida
                  titulo="Cambio de Divisas"
                  descripcion="Realiza cambios entre diferentes monedas de forma segura"
                  ruta="/cambio-divisas"
                  icono={DollarSign}
                />
                <TarjetaAccionRapida
                  titulo="Enviar Dinero"
                  descripcion="Transfiere dinero a otros usuarios o cuentas"
                  ruta="/transferencias"
                  icono={Send}
                />
                <TarjetaAccionRapida
                  titulo="Historial"
                  descripcion="Ver todas las transacciones y movimientos"
                  ruta="/historial"
                  icono={History}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}