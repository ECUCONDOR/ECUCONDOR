import { useEffect, useState } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionStatus } from './TransactionStatus';
import { transactionService } from '@/services/transaction.service';
import { useSession } from '@/hooks/useSession';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export function TransactionHistory() {
  const { user } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      if (!user?.id) return;
      
      try {
        const data = await transactionService.getTransactionsByUser(user.id);
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [user?.id]);

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Historial de Transacciones</h2>
      
      <div className="rounded-lg border border-[#2a2f34] bg-[#1a1f24]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#e5e7eb]">Fecha</TableHead>
              <TableHead className="text-[#e5e7eb]">Monto Original</TableHead>
              <TableHead className="text-[#e5e7eb]">Monto Convertido</TableHead>
              <TableHead className="text-[#e5e7eb]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-[#e5e7eb]">
                  {new Date(transaction.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-[#e5e7eb]">
                  {formatCurrency(transaction.amount, transaction.currency_from)}
                </TableCell>
                <TableCell className="text-[#e5e7eb]">
                  {formatCurrency(transaction.converted_amount, transaction.currency_to)}
                </TableCell>
                <TableCell>
                  <TransactionStatus status={transaction.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
