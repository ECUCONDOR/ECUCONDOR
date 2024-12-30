import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase/client'

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface PaymentInsert extends Omit<Payment, 'id' | 'created_at' | 'updated_at'> {}
export interface PaymentUpdate extends Partial<PaymentInsert> {}

export class PaymentService {
  async getPaymentHistory(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener historial de pagos:', error)
      throw error
    }

    return data || []
  }

  async createPayment(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()

    if (error) {
      console.error('Error al crear pago:', error)
      throw error
    }

    return data
  }

  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status']
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar estado del pago:', error)
      throw error
    }

    return data
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Pago no encontrado
      }
      console.error('Error al obtener pago:', error)
      throw error
    }

    const paymentsData = data.transactions;
    return data
  }
}

// Exportamos una instancia única del servicio
export const paymentService = new PaymentService()
