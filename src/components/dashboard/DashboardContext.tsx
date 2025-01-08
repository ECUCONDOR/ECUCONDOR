'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, CreditCard, QrCode, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import useDashboardData from '@/hooks/useDashboardData'
import DashboardLayout from '@/components/DashboardLayout'
import DepositMethods from '@/components/payments/DepositMethods'
import { Progress } from '@/components/ui/progress'
import { useDashboardContext } from '@/contexts/dashboard-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardContent() {
  const router = useRouter()
  const { data, loading: dataLoading, error: dataError } = useDashboardData()
  const { clientId, setClientId, transactions, isLoading, error: relationError, refetchTransactions } = useDashboardContext()

  useEffect(() => {
    if (!isLoading && !clientId) {
      console.log('No client relation found, redirecting to onboarding')
      router.push('/onboarding')
    }
  }, [clientId, isLoading, router])

  // Mostrar estado de carga mientras se verifica la relación cliente
  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Mostrar error de relación cliente si existe
  if (relationError) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {relationError}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  // Mostrar error de datos si existe
  if (dataError) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {dataError.message}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  // Si no hay datos, mostrar mensaje
  if (!data) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se encontraron datos. Por favor, intenta recargar la página.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  const limiteDiarioPorcentaje = (data.limites.uso_diario / data.limites.diario) * 100

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Mi Billetera</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Saldo Disponible */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponible</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.saldos.disponible.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance disponible para operar
              </p>
              {data.saldos.bloqueado > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  ${data.saldos.bloqueado.toFixed(2)} bloqueados
                </p>
              )}
              <div className="mt-4">
                <Link href="/payments/deposit" legacyBehavior={false} className="w-full">
                  <Button variant="outline" className="w-full">
                    Depositar Fondos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Límites Operativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Límite Diario
              </CardTitle>
              <AlertTriangle className={`h-4 w-4 ${
                limiteDiarioPorcentaje > 80 ? 'text-red-500' : 
                limiteDiarioPorcentaje > 60 ? 'text-yellow-500' : 
                'text-muted-foreground'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={limiteDiarioPorcentaje} className="h-2" />
                <div className="text-sm flex justify-between">
                  <span>${data.limites.uso_diario.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    ${data.limites.diario.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Límite de operaciones diarias
                </p>
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
                {transactions.map((movimiento) => (
                  <div
                    key={movimiento.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {movimiento.descripcion || 
                         (movimiento.tipo === 'ingreso' ? 'Depósito' : 
                          movimiento.tipo === 'egreso' ? 'Retiro' : 
                          'Transferencia')}
                      </p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{new Date(movimiento.created_at).toLocaleDateString()}</span>
                        {movimiento.referencia && (
                          <span className="text-xs">Ref: {movimiento.referencia}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className={`font-bold ${
                        movimiento.tipo === 'ingreso' ? 'text-green-600' : 
                        movimiento.tipo === 'egreso' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}>
                        {movimiento.tipo === 'ingreso' ? '+' : '-'}$
                        {Math.abs(movimiento.amount).toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {movimiento.status}
                      </p>
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
