'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, CreditCard, Clock, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TransactionSummary {
  totalBalance: number
  totalTransactions: number
  activeCards: number
  lastActivity: string | null
  balanceChange: number
}

export function PaymentsDashboard() {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalBalance: 0,
    totalTransactions: 0,
    activeCards: 0,
    lastActivity: null,
    balanceChange: 0,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80">Saldo Total</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(summary.totalBalance)}</h3>
              <p className={`text-sm mt-1 ${summary.balanceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {summary.balanceChange > 0 ? '+' : ''}{summary.balanceChange}%
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Transactions Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80">Transacciones</p>
              <h3 className="text-2xl font-bold mt-2">{summary.totalTransactions}</h3>
              <p className="text-sm mt-1 opacity-80">Últimos 30 días</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <ArrowUpDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Active Cards */}
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80">Tarjetas Activas</p>
              <h3 className="text-2xl font-bold mt-2">{summary.activeCards}</h3>
              <p className="text-sm mt-1 opacity-80">Vinculadas</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Last Activity */}
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80">Última Actividad</p>
              <h3 className="text-2xl font-bold mt-2">{summary.lastActivity || 'N/A'}</h3>
              <p className="text-sm mt-1 opacity-80">Fecha y hora</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => {/* TODO: Implement send money */}}
          className="h-16 text-lg bg-blue-600 hover:bg-blue-700"
        >
          Enviar Dinero
        </Button>
        <Button
          onClick={() => {/* TODO: Implement currency exchange */}}
          className="h-16 text-lg bg-green-600 hover:bg-green-700"
        >
          Cambiar Divisas (USD/ARS)
        </Button>
      </div>
    </div>
  )
}
