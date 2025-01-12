import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type TransactionType = 'USD_TO_ARS' | 'ARS_TO_USD';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  created_at: string;
  type: TransactionType;
  amount: number;
  converted_amount: number;
  exchange_rate: number;
  status: TransactionStatus;
  alias: string;
  receipt_url?: string;
}

export interface TransactionFilters {
  dateRange?: 'today' | 'week' | 'month' | 'all';
  type?: TransactionType | 'all';
  status?: TransactionStatus | 'all';
  search?: string;
}

export const transactionService = {
  async getTransactions(filters: TransactionFilters = {}) {
    const supabase = createClientComponentClient();
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.ilike('alias', `%${filters.search}%`);
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Error al cargar las transacciones');
    }

    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Error al crear la transacción');
    }

    return data;
  },

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Error al actualizar la transacción');
    }

    return data;
  },

  async updateTransactionReceipt(id: string, receipt_url: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('transactions')
      .update({ receipt_url, status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction receipt:', error);
      throw new Error('Error al actualizar el comprobante');
    }

    return data;
  }
};
