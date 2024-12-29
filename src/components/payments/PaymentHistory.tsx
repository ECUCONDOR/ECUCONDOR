'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Payment {
  id: string
  created_at: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  description?: string
}

export function PaymentHistory() {
  const { user, loading: sessionLoading } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchPayments() {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: supabaseError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        if (mounted) {
          setPayments(data || [])
        }
      } catch (err) {
        console.error('Error al cargar pagos:', err)
        if (mounted) {
          setError('No se pudieron cargar los pagos')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (!sessionLoading) {
      fetchPayments()
    }

    return () => {
      mounted = false
    }
  }, [user?.id, sessionLoading])

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-gray-500">
        Debe iniciar sesión para ver su historial de pagos
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No hay pagos registrados
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {new Date(payment.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  payment.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : payment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </span>
              </TableCell>
              <TableCell>{payment.description || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
