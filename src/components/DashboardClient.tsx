'use client';

import useDashboardData from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, CreditCard, QrCode } from 'lucide-react';
import Link from 'next/link';

export function DashboardClient() {
    const { data, loading, error } = useDashboardData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600">
                Error al cargar los datos: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Saldo Actual */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Saldo Actual
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                            }).format(data.saldoActual)}
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
                    </CardContent>
                </Card>

                {/* Acceso Rápido a Pagos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Realizar Pago
                        </CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/payments">
                            <Button className="w-full">
                                Ir a Pagos
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Últimos Movimientos */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Últimos Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {data.ultimosMovimientos.map((movimiento) => (
                            <div
                                key={movimiento.id}
                                className="flex items-center"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {movimiento.tipo}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(movimiento.fecha).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS'
                                    }).format(movimiento.monto)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
