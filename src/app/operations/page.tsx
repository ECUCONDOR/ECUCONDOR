'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Activity, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { useOperations } from '@/hooks/useOperations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Operation {
  id: string;
  tipo: string;
  estado: string;
  descripcion: string;
  fecha_operacion: string;
  monto: number;
  moneda_origen: string;
  moneda_destino?: string;
}

const OperationsPage = () => {
  const { operations, loading, error } = useOperations();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'text-green-500';
      case 'pendiente':
        return 'text-yellow-500';
      case 'fallido':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'deposito':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
      case 'transferencia':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
      case 'cambio':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as 'all' | 'completed' | 'pending');
  };

  const filteredOperations = operations?.filter((operation: Operation) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return operation.estado === 'completado';
    if (filter === 'pending') return operation.estado === 'pendiente';
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600">
          Error al cargar las operaciones: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Operaciones</h1>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border-2 border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">Todas</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredOperations.map((operation: Operation) => (
            <Card key={operation.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getOperationIcon(operation.tipo)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{operation.descripcion}</h3>
                    <p className="text-sm text-gray-500">{formatDate(operation.fecha_operacion)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatAmount(operation.monto, operation.moneda_origen)}
                    {operation.moneda_destino && (
                      <span className="text-gray-500">
                        {' → '}
                        {operation.moneda_destino}
                      </span>
                    )}
                  </p>
                  <p className={`text-sm ${getStatusColor(operation.estado)}`}>
                    {operation.estado}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {filteredOperations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay operaciones que mostrar
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OperationsPage;
