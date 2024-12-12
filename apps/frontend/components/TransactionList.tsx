import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const TransactionList = () => {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setTransactions(res.data);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Error al obtener transacciones');
      }
    };

    if (session?.accessToken) {
      fetchTransactions();
    }
  }, [session]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Transacciones</h2>
      <table className="w-full mt-2 table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Monto</th>
            <th className="px-4 py-2">Moneda</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="border px-4 py-2">{tx.id}</td>
              <td className="border px-4 py-2">{tx.type}</td>
              <td className="border px-4 py-2">{tx.amount}</td>
              <td className="border px-4 py-2">{tx.currency}</td>
              <td className="border px-4 py-2">{tx.status}</td>
              <td className="border px-4 py-2">{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
