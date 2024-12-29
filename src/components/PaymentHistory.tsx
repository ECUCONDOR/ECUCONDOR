'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PaymentTransaction } from '@/types/payment.types';

interface PaymentHistoryProps {
    status: 'all' | 'pending' | 'completed';
}

interface PaymentTransactionWithMethods extends PaymentTransaction {
    payment_methods: {
        name: string;
        provider: string;
    };
}

export function PaymentHistory({ status }: PaymentHistoryProps) {
    const [transactions, setTransactions] = useState<PaymentTransactionWithMethods[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data, error } = await supabase
                    .from('payment_transactions')
                    .select(`
                        *,
                        payment_methods (
                            name,
                            provider
                        )
                    `)
                    .eq('status', status);

                if (error) throw error;
                
                // Asegurar el tipo correcto con una verificación de tipo en tiempo de ejecución
                const typedData = data?.map(transaction => {
                    const { payment_methods, ...rest } = transaction;
                    return {
                        ...rest,
                        payment_methods: {
                            name: payment_methods?.name ?? '',
                            provider: payment_methods?.provider ?? ''
                        }
                    };
                }) as PaymentTransactionWithMethods[];
                
                setTransactions(typedData || []);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [status]);

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            DISPUTED: 'bg-purple-100 text-purple-800',
            REFUNDED: 'bg-gray-100 text-gray-800'
        };

        return (
            <Badge className={statusColors[status] || 'bg-gray-100'}>
                {status.toLowerCase()}
            </Badge>
        );
    };

    if (loading) {
        return <div>Cargando historial de pagos...</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Referencia</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                                {transaction.payment_methods?.name}
                                <span className="ml-2 text-sm text-gray-500">
                                    ({transaction.payment_methods?.provider})
                                </span>
                            </TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: transaction.currency
                                }).format(transaction.amount)}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                                {transaction.provider_transaction_id || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                No hay transacciones para mostrar
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
