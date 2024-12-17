'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import { LineChart, DollarSign, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  {
    title: "Ingresos Totales",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "positive",
    icon: DollarSign
  },
  {
    title: "Usuarios Activos",
    value: "2,338",
    change: "+18.2%",
    changeType: "positive",
    icon: Users
  },
  {
    title: "Transacciones",
    value: "1,257",
    change: "-4.5%",
    changeType: "negative",
    icon: LineChart
  }
];

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Panel de Administración</h2>
          <p className="text-gray-400">Vista general del sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#722F37] bg-opacity-20 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-[#722F37]" />
                  </div>
                  <div className={`flex items-center ${
                    stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-400">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Últimos Usuarios */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Últimos Usuarios Registrados</h3>
          <div className="space-y-4">
            {[
              { name: "Juan Pérez", email: "juan@example.com", date: "Hace 2 horas" },
              { name: "María García", email: "maria@example.com", date: "Hace 5 horas" },
              { name: "Carlos López", email: "carlos@example.com", date: "Hace 1 día" }
            ].map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-[#722F37] bg-opacity-20 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-[#722F37]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-gray-400">{user.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
