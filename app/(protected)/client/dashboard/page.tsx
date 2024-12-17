'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import { DollarSign, Coins } from 'lucide-react';
import Calculator from '@/components/dashboard/Calculator';
import ExchangeRates from '@/components/dashboard/ExchangeRates';
import TransactionTracker from '@/components/dashboard/TransactionTracker';
import FileUpload from '@/components/dashboard/FileUpload';

const stats = [
  {
    title: "Comprar/Depositar",
    value: "",
    icon: DollarSign
  },
  {
    title: "Calculadora",
    component: Calculator,
    icon: Coins
  },
  {
    title: "Comprobante",
    component: FileUpload,
    icon: Coins
  }
];

export default function ClientDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Mi Panel</h2>
          <p className="text-gray-400">Cotizaciones y servicios de cambio disponibles</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const Component = stat.component;
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#722F37] bg-opacity-20 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-[#722F37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">
                    {stat.title}
                  </h3>
                </div>
                {Component ? (
                  <Component />
                ) : (
                  <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Exchange Services */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Servicios de Cambio</h3>
          <ExchangeRates />
        </div>

        {/* Transaction Tracking */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Seguimiento de Operaciones</h3>
          <TransactionTracker />
        </div>
      </div>
    </DashboardLayout>
  );
}
