'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, CreditCard, QrCode, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import useDashboardData from '@/hooks/useDashboardData'
import DashboardLayout from '@/components/DashboardLayout'
import DepositMethods from '@/components/payments/DepositMethods'

export default function DashboardContent() {
  const { data, loading, error } = useDashboardData()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600">
          Error al cargar los datos: {error}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Mi Billetera</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Saldo Actual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.saldoActual.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance disponible en tu cuenta
              </p>
              <div className="mt-4">
                <Link href="/payments/deposit" className="w-full">
                  <Button variant="outline" className="w-full">
                    Depositar Fondos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Transferencias Pendientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transferencias Pendientes
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.transferencias_pendientes}
              </div>
              <p className="text-xs text-muted-foreground">
                Transferencias en proceso
              </p>
            </CardContent>
          </Card>

          {/* Código QR */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tu Código QR</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/qr">
                  Ver código QR
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Métodos de Depósito */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Métodos de Depósito</h2>
          <DepositMethods />
        </div>

        {/* Últimos Movimientos */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.ultimosMovimientos.map((movimiento) => (
                  <div
                    key={movimiento.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{movimiento.tipo}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(movimiento.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`font-bold ${
                        movimiento.tipo === 'ingreso'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}$
                      {Math.abs(movimiento.monto).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
